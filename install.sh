#!/bin/bash

echo "🚀 Think ALM Sales - Installation Script"
echo "========================================"
echo ""

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed. Please install Node.js from https://nodejs.org"
    exit 1
fi

echo "✅ npm found: $(npm --version)"
echo ""

# Fix npm permissions
echo "🔧 Fixing npm cache permissions..."
echo "   (You may be prompted for your password)"
sudo chown -R 501:20 "/Users/charliebailey/.npm"

if [ $? -eq 0 ]; then
    echo "✅ Permissions fixed!"
else
    echo "❌ Failed to fix permissions. Try running manually:"
    echo "   sudo chown -R 501:20 \"/Users/charliebailey/.npm\""
    exit 1
fi

echo ""
echo "📦 Installing dependencies..."
npm install

if [ $? -eq 0 ]; then
    echo "✅ Dependencies installed!"
else
    echo "❌ Installation failed. Check the error above."
    exit 1
fi

echo ""
echo "🎉 Installation complete!"
echo ""
echo "To start the development server, run:"
echo "   npm run dev"
echo ""
echo "Then open http://localhost:5173 in your browser."
echo ""
