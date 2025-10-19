#!/usr/bin/env python3
"""
Custom TensorFlow-style Neural Network for Demographic Field Matching
Offline implementation using NumPy - No external dependencies needed
This is a real neural network with training, not just similarity matching
"""

import numpy as np
import json
import pickle
import os
from typing import List, Dict, Any, Tuple
import warnings
warnings.filterwarnings('ignore')

class NeuralFieldEmbedding:
    """
    Custom Neural Network for learning field name embeddings
    Architecture: Input → Dense(128) → ReLU → Dense(64) → ReLU → Dense(32) → Output
    """
    
    def __init__(self, input_dim: int = 100, embedding_dim: int = 32):
        """
        Initialize the neural network
        
        Args:
            input_dim: Dimension of input character vectors
            embedding_dim: Dimension of learned embeddings
        """
        self.input_dim = input_dim
        self.embedding_dim = embedding_dim
        
        # Initialize network layers with Xavier initialization
        self.W1 = np.random.randn(input_dim, 128) * np.sqrt(2.0 / input_dim)
        self.b1 = np.zeros((1, 128))
        
        self.W2 = np.random.randn(128, 64) * np.sqrt(2.0 / 128)
        self.b2 = np.zeros((1, 64))
        
        self.W3 = np.random.randn(64, embedding_dim) * np.sqrt(2.0 / 64)
        self.b3 = np.zeros((1, embedding_dim))
        
        # Character vocabulary for encoding
        self.char_vocab = self._build_char_vocab()
        self.trained = False
        
    def _build_char_vocab(self) -> Dict[str, int]:
        """Build character to index mapping"""
        chars = 'abcdefghijklmnopqrstuvwxyz0123456789_-. '
        return {char: idx for idx, char in enumerate(chars)}
    
    def _relu(self, x: np.ndarray) -> np.ndarray:
        """ReLU activation function"""
        return np.maximum(0, x)
    
    def _relu_derivative(self, x: np.ndarray) -> np.ndarray:
        """Derivative of ReLU"""
        return (x > 0).astype(float)
    
    def _encode_field_name(self, field_name: str) -> np.ndarray:
        """
        Encode field name as character n-gram feature vector
        
        Args:
            field_name: Field name to encode
            
        Returns:
            Feature vector of size input_dim
        """
        field_name = field_name.lower()[:50]  # Limit length
        
        # Character frequency features
        char_features = np.zeros(len(self.char_vocab))
        for char in field_name:
            if char in self.char_vocab:
                char_features[self.char_vocab[char]] += 1
        
        # Normalize
        if char_features.sum() > 0:
            char_features = char_features / char_features.sum()
        
        # Bigram features
        bigram_features = np.zeros(len(self.char_vocab))
        for i in range(len(field_name) - 1):
            bigram = field_name[i:i+2]
            if bigram[0] in self.char_vocab and bigram[1] in self.char_vocab:
                idx = (self.char_vocab[bigram[0]] + self.char_vocab[bigram[1]]) % len(self.char_vocab)
                bigram_features[idx] += 1
        
        if bigram_features.sum() > 0:
            bigram_features = bigram_features / bigram_features.sum()
        
        # Combine features
        features = np.concatenate([char_features, bigram_features])
        
        # Pad or truncate to input_dim
        if len(features) < self.input_dim:
            features = np.pad(features, (0, self.input_dim - len(features)))
        else:
            features = features[:self.input_dim]
        
        return features.reshape(1, -1)
    
    def forward(self, X: np.ndarray) -> Tuple[np.ndarray, Dict[str, np.ndarray]]:
        """
        Forward pass through the network
        
        Args:
            X: Input features
            
        Returns:
            Output embeddings and cache for backpropagation
        """
        # Layer 1
        Z1 = X @ self.W1 + self.b1
        A1 = self._relu(Z1)
        
        # Layer 2
        Z2 = A1 @ self.W2 + self.b2
        A2 = self._relu(Z2)
        
        # Layer 3
        Z3 = A2 @ self.W3 + self.b3
        
        # L2 normalize output
        norms = np.linalg.norm(Z3, axis=1, keepdims=True)
        norms = np.maximum(norms, 1e-8)  # Avoid division by zero
        A3 = Z3 / norms
        
        cache = {'X': X, 'Z1': Z1, 'A1': A1, 'Z2': Z2, 'A2': A2, 'Z3': Z3, 'A3': A3}
        return A3, cache
    
    def backward(self, cache: Dict[str, np.ndarray], grad_output: np.ndarray, learning_rate: float = 0.01):
        """
        Backward pass - update weights using gradient descent
        
        Args:
            cache: Cached values from forward pass
            grad_output: Gradient of loss with respect to output
            learning_rate: Learning rate for updates
        """
        m = cache['X'].shape[0]
        
        # Layer 3 gradients
        dZ3 = grad_output
        dW3 = (cache['A2'].T @ dZ3) / m
        db3 = np.sum(dZ3, axis=0, keepdims=True) / m
        
        # Layer 2 gradients
        dA2 = dZ3 @ self.W3.T
        dZ2 = dA2 * self._relu_derivative(cache['Z2'])
        dW2 = (cache['A1'].T @ dZ2) / m
        db2 = np.sum(dZ2, axis=0, keepdims=True) / m
        
        # Layer 1 gradients
        dA1 = dZ2 @ self.W2.T
        dZ1 = dA1 * self._relu_derivative(cache['Z1'])
        dW1 = (cache['X'].T @ dZ1) / m
        db1 = np.sum(dZ1, axis=0, keepdims=True) / m
        
        # Update weights
        self.W3 -= learning_rate * dW3
        self.b3 -= learning_rate * db3
        self.W2 -= learning_rate * dW2
        self.b2 -= learning_rate * db2
        self.W1 -= learning_rate * dW1
        self.b1 -= learning_rate * db1
    
    def train_on_pairs(
        self, 
        similar_pairs: List[Tuple[str, str]], 
        dissimilar_pairs: List[Tuple[str, str]],
        epochs: int = 100,
        learning_rate: float = 0.01
    ):
        """
        Train the network using contrastive learning
        
        Args:
            similar_pairs: List of (field1, field2) that are similar
            dissimilar_pairs: List of (field1, field2) that are dissimilar
            epochs: Number of training epochs
            learning_rate: Learning rate
        """
        print(f"Training neural network for {epochs} epochs...")
        
        for epoch in range(epochs):
            total_loss = 0
            
            # Train on similar pairs (minimize distance)
            for field1, field2 in similar_pairs:
                X1 = self._encode_field_name(field1)
                X2 = self._encode_field_name(field2)
                
                # Forward pass
                emb1, cache1 = self.forward(X1)
                emb2, cache2 = self.forward(X2)
                
                # Contrastive loss: similar pairs should be close
                diff = emb1 - emb2
                loss = np.sum(diff ** 2)
                total_loss += loss
                
                # Backward pass
                grad1 = 2 * diff
                grad2 = -2 * diff
                
                self.backward(cache1, grad1, learning_rate)
                self.backward(cache2, grad2, learning_rate)
            
            # Train on dissimilar pairs (maximize distance, up to a margin)
            margin = 1.0
            for field1, field2 in dissimilar_pairs:
                X1 = self._encode_field_name(field1)
                X2 = self._encode_field_name(field2)
                
                # Forward pass
                emb1, cache1 = self.forward(X1)
                emb2, cache2 = self.forward(X2)
                
                # Contrastive loss: dissimilar pairs should be far apart
                diff = emb1 - emb2
                distance = np.sqrt(np.sum(diff ** 2))
                
                if distance < margin:
                    loss = (margin - distance) ** 2
                    total_loss += loss
                    
                    # Backward pass
                    grad_factor = -2 * (margin - distance) / (distance + 1e-8)
                    grad1 = grad_factor * diff
                    grad2 = -grad_factor * diff
                    
                    self.backward(cache1, grad1, learning_rate)
                    self.backward(cache2, grad2, learning_rate)
            
            if (epoch + 1) % 20 == 0:
                avg_loss = total_loss / (len(similar_pairs) + len(dissimilar_pairs))
                print(f"Epoch {epoch + 1}/{epochs}, Loss: {avg_loss:.4f}")
        
        self.trained = True
        print("Training completed!")
    
    def get_embedding(self, field_name: str) -> np.ndarray:
        """Get embedding vector for a field name"""
        X = self._encode_field_name(field_name)
        embedding, _ = self.forward(X)
        return embedding.flatten()
    
    def calculate_similarity(self, field1: str, field2: str) -> float:
        """
        Calculate cosine similarity between two field names
        
        Args:
            field1: First field name
            field2: Second field name
            
        Returns:
            Similarity score between 0 and 1
        """
        emb1 = self.get_embedding(field1)
        emb2 = self.get_embedding(field2)
        
        # Cosine similarity
        similarity = np.dot(emb1, emb2) / (np.linalg.norm(emb1) * np.linalg.norm(emb2) + 1e-8)
        
        # Convert to 0-1 range
        similarity = (similarity + 1) / 2
        
        return float(similarity)
    
    def save_model(self, filepath: str):
        """Save trained model to disk"""
        model_data = {
            'W1': self.W1,
            'b1': self.b1,
            'W2': self.W2,
            'b2': self.b2,
            'W3': self.W3,
            'b3': self.b3,
            'input_dim': self.input_dim,
            'embedding_dim': self.embedding_dim,
            'char_vocab': self.char_vocab,
            'trained': self.trained
        }
        
        with open(filepath, 'wb') as f:
            pickle.dump(model_data, f)
        
        print(f"Model saved to {filepath}")
    
    def load_model(self, filepath: str):
        """Load trained model from disk"""
        with open(filepath, 'rb') as f:
            model_data = pickle.load(f)
        
        self.W1 = model_data['W1']
        self.b1 = model_data['b1']
        self.W2 = model_data['W2']
        self.b2 = model_data['b2']
        self.W3 = model_data['W3']
        self.b3 = model_data['b3']
        self.input_dim = model_data['input_dim']
        self.embedding_dim = model_data['embedding_dim']
        self.char_vocab = model_data['char_vocab']
        self.trained = model_data['trained']
        
        print(f"Model loaded from {filepath}")
