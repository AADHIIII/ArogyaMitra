#!/bin/bash

echo "🎉 STEP 3: Opening ArogyaMitra Website..."
echo "========================================"

echo "🌐 Opening http://localhost:3011 in your browser..."

# Try to open in browser (works on macOS)
if command -v open &> /dev/null; then
    open http://localhost:3011
elif command -v xdg-open &> /dev/null; then
    xdg-open http://localhost:3011
elif command -v start &> /dev/null; then
    start http://localhost:3011
else
    echo "✅ Please manually open: http://localhost:3011"
fi

echo ""
echo "🎯 What you should see:"
echo "- ArogyaMitra homepage"
echo "- 'Your Doctor in Your Pocket' title"
echo "- 'I'm a Patient' and 'I'm a Doctor' buttons"
echo ""
echo "🚀 Ready to use ArogyaMitra!"