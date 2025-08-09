# Local LLM Setup Guide for Zengent AI

## Recommended Models for Code Analysis

### 1. **Code Llama (Recommended for Java/Python)**
Best for general code analysis and architecture understanding.

```bash
# Install Ollama (if not already installed)
curl -fsSL https://ollama.com/install.sh | sh

# Pull Code Llama 7B (smaller, faster)
ollama pull codellama:7b

# OR Pull Code Llama 13B (better quality, slower)
ollama pull codellama:13b

# Start Ollama server
ollama serve
```

### 2. **Deepseek Coder (Best for Enterprise Analysis)**
Excellent for Spring Boot, enterprise patterns, and architectural insights.

```bash
# Pull Deepseek Coder
ollama pull deepseek-coder:6.7b

# OR the larger version
ollama pull deepseek-coder:33b
```

### 3. **Llama 3 (General Purpose)**
Good all-around model for analysis and suggestions.

```bash
# Pull Llama 3 8B
ollama pull llama3:8b

# OR Llama 3 70B (requires more RAM)
ollama pull llama3:70b
```

## Installation Steps

### Step 1: Install Ollama

#### On Linux/macOS:
```bash
curl -fsSL https://ollama.com/install.sh | sh
```

#### On Windows:
1. Download from: https://ollama.com/download/windows
2. Run the installer
3. Open Command Prompt or PowerShell

### Step 2: Start Ollama Service
```bash
# Start the Ollama server (runs on port 11434 by default)
ollama serve
```

### Step 3: Pull Your Chosen Model
```bash
# For code analysis (recommended for beginners)
ollama pull codellama:7b

# For enterprise analysis (recommended for this project)
ollama pull deepseek-coder:6.7b
```

### Step 4: Test the Model
```bash
# Test the model is working
ollama run codellama:7b "Explain what Spring Boot is"
```

## Configuration in Zengent AI

1. **Open the application** in your browser
2. **Go to Settings** (gear icon in the sidebar)
3. **Select "Local LLM (Ollama)"** 
4. **Configure**:
   - **Local Endpoint**: `http://localhost:11434`
   - **Model Name**: `codellama:7b` (or your chosen model)
5. **Click "Apply Configuration"**

## Model Recommendations by Use Case

| Model | Size | RAM Required | Best For |
|-------|------|--------------|----------|
| `codellama:7b` | 3.8GB | 8GB RAM | General code analysis |
| `deepseek-coder:6.7b` | 3.9GB | 8GB RAM | Enterprise patterns |
| `codellama:13b` | 7.3GB | 16GB RAM | Better code quality |
| `deepseek-coder:33b` | 19GB | 32GB RAM | Professional analysis |

## Troubleshooting

### If Ollama won't start:
```bash
# Check if already running
ps aux | grep ollama

# Kill existing processes
pkill ollama

# Restart
ollama serve
```

### If model download fails:
```bash
# Check available models
ollama list

# Remove and re-download
ollama rm codellama:7b
ollama pull codellama:7b
```

### Check Ollama status:
```bash
# Test connection
curl http://localhost:11434/api/tags
```

## Performance Tips

1. **Start with smaller models** (7B parameters) for testing
2. **Use SSD storage** for better model loading speed
3. **Close other applications** to free up RAM
4. **Consider GPU acceleration** if you have NVIDIA GPU

## Security Benefits

- ✅ **Complete Privacy**: No data sent to external servers
- ✅ **Offline Operation**: Works without internet
- ✅ **Enterprise Compliance**: Meets strict data policies
- ✅ **Custom Control**: Full control over analysis process

## Next Steps

1. Install Ollama following the steps above
2. Pull the `deepseek-coder:6.7b` model (recommended for this project)
3. Configure Zengent AI to use Local LLM
4. Test with a sample project analysis

Your code analysis will now run completely locally with professional-grade AI insights!