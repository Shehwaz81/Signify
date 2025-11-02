"""
Advanced Sign Language Translation Service using MediaPipe Holistic and temporal recognition
"""

import cv2
import numpy as np
import mediapipe as mp
from PIL import Image
import io
import logging
from typing import List, Dict, Any, Optional, Tuple
import os
import json
from collections import deque
import time

from ..config import settings

logger = logging.getLogger(__name__)

class SignLanguageService:
    """Advanced service for sign language translation using MediaPipe Holistic and temporal recognition"""
    
    def __init__(self):
        self.mp_holistic = mp.solutions.holistic
        self.mp_drawing = mp.solutions.drawing_utils
        self.mp_drawing_styles = mp.solutions.drawing_styles
        self.holistic = None
        self.is_initialized = False
        
        # Temporal recognition for moving letters (J, Z) and gestures
        self.landmark_sequence = deque(maxlen=30)  # Store last 30 frames
        self.gesture_history = deque(maxlen=10)     # Store gesture history
        
        # Enhanced sign dictionary with common gestures
        self.sign_dictionary = self._load_enhanced_sign_dictionary()
        self.gesture_patterns = self._load_gesture_patterns()
        
        self._initialize_mediapipe()
    
    def _initialize_mediapipe(self):
        """Initialize MediaPipe Holistic solution for comprehensive body tracking"""
        try:
            # Use lowest complexity (0) to save memory - still accurate for sign language
            # Only initialize when first request comes in (lazy loading)
            # Don't initialize here - will be done on first use
            self.is_initialized = True
            logger.info("Sign language service ready (MediaPipe will initialize on first use)")
            
        except Exception as e:
            logger.error(f"Failed to initialize sign language service: {str(e)}")
            self.is_initialized = False
    
    def _get_holistic(self):
        """Lazy initialization of MediaPipe Holistic to save memory at startup"""
        if self.holistic is None:
            try:
                self.holistic = self.mp_holistic.Holistic(
                    static_image_mode=False,
                    model_complexity=0,  # Lowest complexity to save memory (was 2)
                    enable_segmentation=False,
                    refine_face_landmarks=False,  # Disable to save memory
                    min_detection_confidence=0.5,
                    min_tracking_confidence=0.5
                )
                logger.info("MediaPipe Holistic initialized (lazy loading)")
            except Exception as e:
                logger.error(f"Failed to initialize MediaPipe: {str(e)}")
                raise
        return self.holistic
    
    def _load_enhanced_sign_dictionary(self) -> Dict[str, str]:
        """Load comprehensive ASL dictionary including common gestures"""
        return {
            # ASL Alphabet
            "A": "A", "B": "B", "C": "C", "D": "D", "E": "E", "F": "F", "G": "G", "H": "H",
            "I": "I", "J": "J", "K": "K", "L": "L", "M": "M", "N": "N", "O": "O", "P": "P",
            "Q": "Q", "R": "R", "S": "S", "T": "T", "U": "U", "V": "V", "W": "W", "X": "X",
            "Y": "Y", "Z": "Z",
            
            # Common Words and Phrases
            "HELLO": "Hello", "GOODBYE": "Goodbye", "THANK_YOU": "Thank you", 
            "PLEASE": "Please", "SORRY": "Sorry", "YES": "Yes", "NO": "No",
            "GOOD": "Good", "BAD": "Bad", "LOVE": "Love", "HATE": "Hate",
            "FAMILY": "Family", "FRIEND": "Friend", "WORK": "Work", "HOME": "Home",
            "FOOD": "Food", "WATER": "Water", "HELP": "Help", "STOP": "Stop",
            "GO": "Go", "COME": "Come", "WANT": "Want", "NEED": "Need",
            "HOW": "How", "WHAT": "What", "WHERE": "Where", "WHEN": "When",
            "WHY": "Why", "WHO": "Who", "HOW_MUCH": "How much", "HOW_MANY": "How many",
            
            # Numbers
            "ONE": "1", "TWO": "2", "THREE": "3", "FOUR": "4", "FIVE": "5",
            "SIX": "6", "SEVEN": "7", "EIGHT": "8", "NINE": "9", "TEN": "10",
            
            # Colors
            "RED": "Red", "BLUE": "Blue", "GREEN": "Green", "YELLOW": "Yellow",
            "BLACK": "Black", "WHITE": "White", "BROWN": "Brown", "PINK": "Pink",
            
            # Emotions
            "HAPPY": "Happy", "SAD": "Sad", "ANGRY": "Angry", "EXCITED": "Excited",
            "TIRED": "Tired", "SICK": "Sick", "HUNGRY": "Hungry", "THIRSTY": "Thirsty"
        }
    
    def _load_gesture_patterns(self) -> Dict[str, Dict]:
        """Load gesture patterns for temporal recognition"""
        return {
            "HELLO": {
                "description": "Wave gesture - hand moves from ear outward",
                "key_points": ["hand_near_ear", "outward_movement"],
                "temporal_required": True,
                "movement_threshold": 0.1
            },
            "J": {
                "description": "Letter J - hand traces J shape in air",
                "key_points": ["downward_movement", "curved_movement"],
                "temporal_required": True,
                "movement_threshold": 0.15
            },
            "Z": {
                "description": "Letter Z - hand traces Z shape in air",
                "key_points": ["horizontal_movement", "diagonal_movement"],
                "temporal_required": True,
                "movement_threshold": 0.12
            },
            "THANK_YOU": {
                "description": "Thank you - hand touches chin then moves forward",
                "key_points": ["hand_at_chin", "forward_movement"],
                "temporal_required": True,
                "movement_threshold": 0.08
            },
            "PLEASE": {
                "description": "Please - circular motion over chest",
                "key_points": ["circular_movement", "chest_location"],
                "temporal_required": True,
                "movement_threshold": 0.1
            }
        }
    
    def is_ready(self) -> bool:
        """Check if the service is ready"""
        return self.is_initialized
    
    async def translate_gesture(self, image_data: bytes) -> Dict[str, Any]:
        """
        Translate sign language gesture to text using advanced recognition
        
        Args:
            image_data: Image bytes
            
        Returns:
            Dictionary containing translated text and confidence
        """
        try:
            # Convert bytes to image
            image = Image.open(io.BytesIO(image_data))
            image = image.convert('RGB')
            frame = np.array(image)
            
            # Process with MediaPipe Holistic
            holistic = self._get_holistic()
            results = holistic.process(frame)
            
            # Extract landmarks
            landmarks = self._extract_comprehensive_landmarks(results)
            
            if not landmarks:
                return {
                    "text": "No hands detected",
                    "confidence": 0.0
                }
            
            # Add to sequence for temporal analysis
            self.landmark_sequence.append(landmarks)
            
            # Classify gesture (both static and temporal)
            gesture, confidence = self._classify_gesture_advanced(landmarks)
            
            # Store in history
            self.gesture_history.append((gesture, confidence, time.time()))
            
            # Ensure we return the gesture text properly
            gesture_text = gesture if isinstance(gesture, str) else str(gesture)
            
            return {
                "text": gesture_text,
                "confidence": confidence
            }
            
        except Exception as e:
            logger.error(f"Sign language translation error: {str(e)}")
            return {
                "text": "Translation failed",
                "confidence": 0.0
            }
    
    def _extract_comprehensive_landmarks(self, results) -> Optional[Dict]:
        """Extract comprehensive landmarks from MediaPipe Holistic results"""
        landmarks = {}
        
        # Hand landmarks (both hands)
        if results.left_hand_landmarks:
            landmarks['left_hand'] = self._extract_hand_landmarks(results.left_hand_landmarks)
        
        if results.right_hand_landmarks:
            landmarks['right_hand'] = self._extract_hand_landmarks(results.right_hand_landmarks)
        
        # Pose landmarks (for body context)
        if results.pose_landmarks:
            landmarks['pose'] = self._extract_pose_landmarks(results.pose_landmarks)
        
        # Face landmarks (for facial expressions in ASL)
        if results.face_landmarks:
            landmarks['face'] = self._extract_face_landmarks(results.face_landmarks)
        
        return landmarks if landmarks else None
    
    def _extract_hand_landmarks(self, hand_landmarks) -> List[Dict[str, float]]:
        """Extract hand landmarks with additional features"""
        landmarks = []
        for landmark in hand_landmarks.landmark:
            landmarks.append({
                "x": landmark.x,
                "y": landmark.y,
                "z": landmark.z,
                "visibility": getattr(landmark, 'visibility', 1.0)
            })
        return landmarks
    
    def _extract_pose_landmarks(self, pose_landmarks) -> List[Dict[str, float]]:
        """Extract pose landmarks for body context"""
        landmarks = []
        for landmark in pose_landmarks.landmark:
            landmarks.append({
                "x": landmark.x,
                "y": landmark.y,
                "z": landmark.z,
                "visibility": getattr(landmark, 'visibility', 1.0)
            })
        return landmarks
    
    def _extract_face_landmarks(self, face_landmarks) -> List[Dict[str, float]]:
        """Extract face landmarks for facial expressions"""
        landmarks = []
        for landmark in face_landmarks.landmark:
            landmarks.append({
                "x": landmark.x,
                "y": landmark.y,
                "z": landmark.z,
                "visibility": getattr(landmark, 'visibility', 1.0)
            })
        return landmarks
    
    def _classify_gesture_advanced(self, landmarks: Dict) -> Tuple[str, float]:
        """
        Advanced gesture classification using both static and temporal analysis
        """
        try:
            # Static gesture recognition
            static_gesture, static_confidence = self._classify_static_gesture(landmarks)
            
            # Temporal gesture recognition (for moving letters and gestures)
            temporal_gesture, temporal_confidence = self._classify_temporal_gesture()
            
            # Combine results - prefer temporal if confidence is similar
            if temporal_confidence > 0.7 and temporal_confidence >= static_confidence * 0.9:
                translated = self.sign_dictionary.get(temporal_gesture, temporal_gesture)
                return translated, temporal_confidence
            elif static_confidence > 0.6:
                translated = self.sign_dictionary.get(static_gesture, static_gesture)
                return translated, static_confidence
            else:
                return "Unknown gesture", 0.3
                
        except Exception as e:
            logger.error(f"Advanced gesture classification error: {str(e)}")
            return "Unknown gesture", 0.0
    
    def _classify_static_gesture(self, landmarks: Dict) -> Tuple[str, float]:
        """Classify static hand gestures with improved accuracy"""
        if 'right_hand' in landmarks:
            hand_landmarks = landmarks['right_hand']
        elif 'left_hand' in landmarks:
            hand_landmarks = landmarks['left_hand']
        else:
            return "No hand detected", 0.0
        
        if len(hand_landmarks) < 21:
            return "Hand not fully detected", 0.0
        
        # Enhanced finger counting
        fingers_up = self._count_fingers_advanced(hand_landmarks)
        
        # Improved ASL alphabet recognition with better patterns
        letter = self._recognize_asl_letter_improved(hand_landmarks)
        if letter and letter != "Unknown":
            return letter, 0.85
        
        # Common gesture recognition
        gesture = self._recognize_common_gesture(hand_landmarks)
        if gesture:
            return gesture, 0.75
        
        # Enhanced finger-based recognition
        if fingers_up == 0:
            return "A", 0.7  # Fist = A in ASL
        elif fingers_up == 1:
            # Determine which finger is up
            if hand_landmarks[8]['y'] < hand_landmarks[6]['y']:  # Index finger up
                return "I", 0.7
            elif hand_landmarks[4]['x'] > hand_landmarks[3]['x']:  # Thumb up
                return "Thumbs up", 0.65
            else:
                return "One", 0.6
        elif fingers_up == 2:
            # Check for V (peace sign) or L shape
            if (hand_landmarks[8]['y'] < hand_landmarks[6]['y'] and 
                hand_landmarks[12]['y'] < hand_landmarks[10]['y']):
                # Check if thumb is closed
                if hand_landmarks[4]['x'] < hand_landmarks[3]['x']:
                    return "V", 0.8
            return "Two", 0.6
        elif fingers_up == 3:
            return "W", 0.65
        elif fingers_up == 4:
            return "Four", 0.6
        elif fingers_up == 5:
            return "B", 0.7  # Open hand = B in ASL
        else:
            return "Unknown gesture", 0.3
    
    def _classify_temporal_gesture(self) -> Tuple[str, float]:
        """Classify temporal gestures (moving letters J, Z, and common gestures)"""
        if len(self.landmark_sequence) < 5:  # Need at least 5 frames
            return "Insufficient data", 0.0
        
        # Analyze movement patterns
        movement_pattern = self._analyze_movement_pattern()
        
        # Check for specific temporal gestures
        for gesture_name, pattern in self.gesture_patterns.items():
            if pattern.get("temporal_required", False):
                if self._matches_temporal_pattern(gesture_name, movement_pattern):
                    # Return with translated text
                    translated = self.sign_dictionary.get(gesture_name, gesture_name)
                    return translated, 0.9
        
        return "No temporal gesture detected", 0.0
    
    def _analyze_movement_pattern(self) -> Dict[str, Any]:
        """Analyze movement pattern from landmark sequence"""
        if len(self.landmark_sequence) < 2:
            return {}
        
        # Get hand positions over time
        hand_positions = []
        for landmarks in self.landmark_sequence:
            if 'right_hand' in landmarks:
                hand_positions.append(self._get_hand_center(landmarks['right_hand']))
            elif 'left_hand' in landmarks:
                hand_positions.append(self._get_hand_center(landmarks['left_hand']))
        
        if len(hand_positions) < 2:
            return {}
        
        # Calculate movement vectors
        movements = []
        for i in range(1, len(hand_positions)):
            dx = hand_positions[i]['x'] - hand_positions[i-1]['x']
            dy = hand_positions[i]['y'] - hand_positions[i-1]['y']
            movements.append({'dx': dx, 'dy': dy})
        
        # Analyze movement characteristics
        total_movement = sum(np.sqrt(m['dx']**2 + m['dy']**2) for m in movements)
        avg_movement = total_movement / len(movements) if movements else 0
        
        # Determine movement direction
        net_dx = sum(m['dx'] for m in movements)
        net_dy = sum(m['dy'] for m in movements)
        
        return {
            'total_movement': total_movement,
            'avg_movement': avg_movement,
            'net_dx': net_dx,
            'net_dy': net_dy,
            'movements': movements
        }
    
    def _get_hand_center(self, hand_landmarks: List[Dict]) -> Dict[str, float]:
        """Get center point of hand"""
        if not hand_landmarks:
            return {'x': 0, 'y': 0, 'z': 0}
        
        x = sum(landmark['x'] for landmark in hand_landmarks) / len(hand_landmarks)
        y = sum(landmark['y'] for landmark in hand_landmarks) / len(hand_landmarks)
        z = sum(landmark['z'] for landmark in hand_landmarks) / len(hand_landmarks)
        
        return {'x': x, 'y': y, 'z': z}
    
    def _matches_temporal_pattern(self, gesture_name: str, movement_pattern: Dict) -> bool:
        """Check if movement pattern matches a specific temporal gesture"""
        if not movement_pattern:
            return False
        
        pattern = self.gesture_patterns.get(gesture_name, {})
        threshold = pattern.get("movement_threshold", 0.1)
        
        # Check if movement is significant enough
        if movement_pattern.get('avg_movement', 0) < threshold:
            return False
        
        # Gesture-specific pattern matching
        if gesture_name == "HELLO":
            # Wave gesture: horizontal movement outward
            return abs(movement_pattern.get('net_dx', 0)) > abs(movement_pattern.get('net_dy', 0))
        
        elif gesture_name == "J":
            # J shape: downward then curved movement
            movements = movement_pattern.get('movements', [])
            if len(movements) >= 2:
                # Check for downward then curved movement
                return any(m['dy'] > 0.05 for m in movements)  # Downward movement
        
        elif gesture_name == "Z":
            # Z shape: horizontal, diagonal, horizontal
            movements = movement_pattern.get('movements', [])
            if len(movements) >= 3:
                # Check for horizontal-diagonal-horizontal pattern
                return any(abs(m['dx']) > abs(m['dy']) for m in movements)  # Horizontal movement
        
        elif gesture_name == "THANK_YOU":
            # Thank you: forward movement
            return movement_pattern.get('net_dx', 0) > 0.05
        
        elif gesture_name == "PLEASE":
            # Please: circular movement
            movements = movement_pattern.get('movements', [])
            if len(movements) >= 4:
                # Check for circular pattern (simplified)
                return movement_pattern.get('total_movement', 0) > 0.1
        
        return False
    
    def _count_fingers_advanced(self, hand_landmarks: List[Dict]) -> int:
        """Advanced finger counting with better accuracy"""
        if len(hand_landmarks) < 21:  # MediaPipe hands has 21 landmarks
            return 0
        
        # Landmark indices for finger tips and PIP joints
        finger_tips = [4, 8, 12, 16, 20]  # Thumb, Index, Middle, Ring, Pinky
        finger_pips = [3, 6, 10, 14, 18]  # Corresponding PIP joints
        
        fingers_up = 0
        
        # Check each finger
        for i, (tip_idx, pip_idx) in enumerate(zip(finger_tips, finger_pips)):
            if i == 0:  # Thumb (different logic)
                # For thumb, check if tip is to the right of PIP
                if (hand_landmarks[tip_idx]['x'] > hand_landmarks[pip_idx]['x']):
                    fingers_up += 1
            else:  # Other fingers
                # For other fingers, check if tip is above PIP
                if (hand_landmarks[tip_idx]['y'] < hand_landmarks[pip_idx]['y']):
                    fingers_up += 1
        
        return fingers_up
    
    def _recognize_asl_letter_improved(self, hand_landmarks: List[Dict]) -> Optional[str]:
        """Improved ASL letter recognition with better pattern matching"""
        if len(hand_landmarks) < 21:
            return None
        
        # Get finger states
        fingers_up = self._count_fingers_advanced(hand_landmarks)
        
        # Get specific finger positions for better recognition
        thumb_tip = hand_landmarks[4]
        index_tip = hand_landmarks[8]
        middle_tip = hand_landmarks[12]
        ring_tip = hand_landmarks[16]
        pinky_tip = hand_landmarks[20]
        
        thumb_ip = hand_landmarks[3]
        index_pip = hand_landmarks[6]
        middle_pip = hand_landmarks[10]
        ring_pip = hand_landmarks[14]
        pinky_pip = hand_landmarks[18]
        
        # A - Fist (all fingers down, thumb may be up)
        if fingers_up == 0 or (fingers_up == 1 and thumb_tip['x'] > thumb_ip['x']):
            return "A"
        
        # B - All fingers extended, thumb in
        if (fingers_up == 4 and 
            index_tip['y'] < index_pip['y'] and
            middle_tip['y'] < middle_pip['y'] and
            ring_tip['y'] < ring_pip['y'] and
            pinky_tip['y'] < pinky_pip['y'] and
            thumb_tip['x'] < thumb_ip['x']):
            return "B"
        
        # C - Curved hand (fingers partially extended)
        if (index_tip['y'] < index_pip['y'] * 1.2 and
            middle_tip['y'] < middle_pip['y'] * 1.2):
            return "C"
        
        # D - Only index finger extended
        if (fingers_up == 1 and 
            index_tip['y'] < index_pip['y'] and
            middle_tip['y'] > middle_pip['y'] and
            ring_tip['y'] > ring_pip['y'] and
            pinky_tip['y'] > pinky_pip['y']):
            return "D"
        
        # E - All fingers bent, thumb over fingers
        if (fingers_up == 0 and
            thumb_tip['x'] > thumb_ip['x']):
            return "E"
        
        # F - OK sign (thumb and index touching)
        thumb_index_dist = np.sqrt(
            (thumb_tip['x'] - index_tip['x'])**2 + 
            (thumb_tip['y'] - index_tip['y'])**2
        )
        if thumb_index_dist < 0.03 and fingers_up == 2:
            return "F"
        
        # I - Only pinky extended
        if (fingers_up == 1 and
            pinky_tip['y'] < pinky_pip['y'] and
            index_tip['y'] > index_pip['y']):
            return "I"
        
        # L - Index and thumb extended in L shape
        if (index_tip['y'] < index_pip['y'] and
            thumb_tip['x'] > thumb_ip['x'] and
            middle_tip['y'] > middle_pip['y']):
            return "L"
        
        # O - All fingers together forming O
        if (fingers_up == 0 and
            thumb_index_dist < 0.04):
            return "O"
        
        # V - Index and middle extended (peace sign)
        if (self._is_index_middle_up(hand_landmarks) and
            ring_tip['y'] > ring_pip['y'] and
            pinky_tip['y'] > pinky_pip['y']):
            return "V"
        
        # W - Index, middle, ring extended
        if (index_tip['y'] < index_pip['y'] and
            middle_tip['y'] < middle_pip['y'] and
            ring_tip['y'] < ring_pip['y'] and
            pinky_tip['y'] > pinky_pip['y']):
            return "W"
        
        # Y - Index and pinky extended
        if self._is_index_pinky_up(hand_landmarks):
            return "Y"
        
        return None
    
    def _recognize_common_gesture(self, hand_landmarks: List[Dict]) -> Optional[str]:
        """Recognize common ASL gestures"""
        if len(hand_landmarks) < 21:
            return None
        
        # Check for specific gesture patterns
        if self._is_thumbs_up(hand_landmarks):
            return "Thumbs up"
        elif self._is_ok_sign(hand_landmarks):
            return "OK"
        elif self._is_rock_on(hand_landmarks):
            return "Rock on"
        elif self._is_shaka(hand_landmarks):
            return "Shaka"
        
        return None
    
    def _is_thumb_up(self, hand_landmarks: List[Dict]) -> bool:
        """Check if thumb is up"""
        if len(hand_landmarks) < 21:
            return False
        return hand_landmarks[4]['x'] > hand_landmarks[3]['x']
    
    def _is_index_middle_up(self, hand_landmarks: List[Dict]) -> bool:
        """Check if index and middle fingers are up"""
        if len(hand_landmarks) < 21:
            return False
        return (hand_landmarks[8]['y'] < hand_landmarks[6]['y'] and 
                hand_landmarks[12]['y'] < hand_landmarks[10]['y'])
    
    def _is_index_pinky_up(self, hand_landmarks: List[Dict]) -> bool:
        """Check if index and pinky fingers are up"""
        if len(hand_landmarks) < 21:
            return False
        return (hand_landmarks[8]['y'] < hand_landmarks[6]['y'] and 
                hand_landmarks[20]['y'] < hand_landmarks[18]['y'])
    
    def _is_thumbs_up(self, hand_landmarks: List[Dict]) -> bool:
        """Check for thumbs up gesture"""
        if len(hand_landmarks) < 21:
            return False
        return (self._is_thumb_up(hand_landmarks) and 
                self._count_fingers_advanced(hand_landmarks) == 1)
    
    def _is_ok_sign(self, hand_landmarks: List[Dict]) -> bool:
        """Check for OK sign (thumb and index finger touching)"""
        if len(hand_landmarks) < 21:
            return False
        # Simplified check - in reality would need more complex logic
        return self._count_fingers_advanced(hand_landmarks) == 2
    
    def _is_rock_on(self, hand_landmarks: List[Dict]) -> bool:
        """Check for rock on gesture (index and pinky up)"""
        return self._is_index_pinky_up(hand_landmarks)
    
    def _is_shaka(self, hand_landmarks: List[Dict]) -> bool:
        """Check for shaka gesture (thumb and pinky up)"""
        if len(hand_landmarks) < 21:
            return False
        return (self._is_thumb_up(hand_landmarks) and 
                hand_landmarks[20]['y'] < hand_landmarks[18]['y'] and
                self._count_fingers_advanced(hand_landmarks) == 2)
