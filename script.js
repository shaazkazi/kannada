document.addEventListener('DOMContentLoaded', function() {
    // Elements
    const textInput = document.getElementById('text-input');
    const fontSizeInput = document.getElementById('font-size');
    const fontSizeValue = document.getElementById('font-size-value');
    const fontWeightSelect = document.getElementById('font-weight');
    const imageSizeSelect = document.getElementById('image-size');
    const logoUpload = document.getElementById('logo-upload');
    const logoSizeInput = document.getElementById('logo-size');
    const logoSizeValue = document.getElementById('logo-size-value');
    const generateBtn = document.getElementById('generate-btn');
    const downloadBtn = document.getElementById('download-btn');
    
    // Preview elements
    const imagePreview = document.getElementById('image-preview');
    const textContent = document.getElementById('text-content');
    const footerBar = document.getElementById('footer-bar');
    const logoPreview = document.getElementById('logo-preview');
    
    // Create paste button
    const pasteButton = document.createElement('button');
    pasteButton.type = 'button';
    pasteButton.id = 'paste-btn';
    pasteButton.className = 'paste-button';
    pasteButton.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"></path>
            <rect x="8" y="2" width="8" height="4" rx="1" ry="1"></rect>
            <path d="M9 12h6"></path>
            <path d="M12 9v6"></path>
        </svg>
        <span>Paste</span>
    `;
    
    // Insert paste button after text input
    textInput.parentNode.insertBefore(pasteButton, textInput.nextSibling);
    
    // Add event listener for paste button
    pasteButton.addEventListener('click', async function() {
        try {
            const text = await navigator.clipboard.readText();
            textInput.value = text;
            // Trigger input event to update preview
            textInput.dispatchEvent(new Event('input'));
            
            // Show success animation
            pasteButton.classList.add('paste-success');
            setTimeout(() => {
                pasteButton.classList.remove('paste-success');
            }, 1000);
        } catch (err) {
            // Show error animation
            pasteButton.classList.add('paste-error');
            setTimeout(() => {
                pasteButton.classList.remove('paste-error');
            }, 1000);
            
            // Fallback for browsers that don't support clipboard API
            textInput.focus();
            alert('Please use Ctrl+V or Command+V to paste text');
        }
    });
    
    // Default values
    let bgColor = '#3498db';
    let textColor = '#ffffff';
    let footerColor = '#2980b9';
    let logoImage = null;
    let defaultLogoImage = null;
    let defaultLogoLoaded = false;
    let currentImageUrl = null; // Store the current image URL for download
    
    // Load default logo
    const defaultLogo = new Image();
    defaultLogo.onload = function() {
        defaultLogoImage = defaultLogo.src;
        logoPreview.src = defaultLogoImage;
        logoPreview.style.display = 'block';
        defaultLogoLoaded = true;
        
        // Set initial logo size based on footer height
        const footerHeight = parseFloat(getComputedStyle(footerBar).height);
        const logoHeight = footerHeight * 0.7; // 70% of footer height
        logoSizeInput.value = Math.round(logoHeight);
        logoSizeValue.textContent = `${Math.round(logoHeight)}px`;
        logoPreview.style.height = `${Math.round(logoHeight)}px`;
    };
    defaultLogo.onerror = function() {
        console.warn('Default logo could not be loaded');
        defaultLogoLoaded = false;
    };
    defaultLogo.src = 'images/logo.png';
    
    // Event listeners
    textInput.addEventListener('input', updatePreview);
    fontSizeInput.addEventListener('input', updateFontSize);
    fontWeightSelect.addEventListener('change', updatePreview);
    imageSizeSelect.addEventListener('change', updateImageSize);
    logoUpload.addEventListener('change', handleLogoUpload);
    logoSizeInput.addEventListener('input', updateLogoSize);
    generateBtn.addEventListener('click', generateImage);
    downloadBtn.addEventListener('click', function() {
        if (currentImageUrl) {
            downloadImage(currentImageUrl);
        }
    });
    
    // Color picker functionality
    const colorTabButtons = document.querySelectorAll('.color-tab-button');
    const colorTabs = document.querySelectorAll('.color-tab');
    const colorOptions = document.querySelectorAll('.color-option');

    // Tab switching
    colorTabButtons.forEach(button => {
        button.addEventListener('click', () => {
            // Remove active class from all buttons and tabs
            colorTabButtons.forEach(btn => btn.classList.remove('active'));
            colorTabs.forEach(tab => tab.classList.remove('active'));
            
            // Add active class to clicked button and corresponding tab
            button.classList.add('active');
            const tabId = button.getAttribute('data-tab');
            document.getElementById(`${tabId}-tab`).classList.add('active');
        });
    });

    // Color selection
    colorOptions.forEach(option => {
        option.addEventListener('click', () => {
            // Remove selected class from all options
            colorOptions.forEach(opt => {
                opt.classList.remove('selected');
                opt.setAttribute('aria-checked', 'false');
                opt.setAttribute('tabindex', '-1');
            });
            
            // Add selected class to clicked option
            option.classList.add('selected');
            option.setAttribute('aria-checked', 'true');
            option.setAttribute('tabindex', '0');
            
            // Get color values
            bgColor = option.getAttribute('data-bg');
            textColor = option.getAttribute('data-text');
            footerColor = option.getAttribute('data-footer');
            
            // Update preview colors
            imagePreview.style.backgroundColor = bgColor;
            textContent.style.color = textColor;
            footerBar.style.backgroundColor = footerColor;
        });
    });

    // Keyboard navigation for color options
    colorOptions.forEach(option => {
        option.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                option.click();
            }
        });
    });

    // Set initial selected color
    // Find the first color option and select it if none is selected
    if (!document.querySelector('.color-option.selected')) {
        const firstOption = document.querySelector('.color-option');
        if (firstOption) {
            firstOption.click();
        }
    }
    
    // Initialize preview
    updatePreview();
    updateImageSize(); // Set initial image size
    updateFooterHeight();
    
    // Functions
    function updatePreview() {
        // Get the text from the input
        const inputText = textInput.value || 'ಇಲ್ಲಿ ನಿಮ್ಮ ಕನ್ನಡ ಪಠ್ಯ ಕಾಣಿಸುತ್ತದೆ';
        
        // Clear previous content
        textContent.innerHTML = '';
        
        // Split text by line breaks and create paragraph elements
        const paragraphs = inputText.split('\n');
        
        paragraphs.forEach(paragraph => {
            const p = document.createElement('p');
            p.textContent = paragraph;
            p.style.margin = '0';
            p.style.padding = '0';
            textContent.appendChild(p);
        });
        
        // Apply font weight
        textContent.style.fontWeight = fontWeightSelect.value;
    }
    
    function updateFontSize() {
        const size = fontSizeInput.value;
        fontSizeValue.textContent = `${size}px`;
        textContent.style.fontSize = `${size}px`;
        
        // Ensure text stays within bounds
        adjustTextPosition();
    }
    
    function adjustTextPosition() {
        // Get the text content's actual height
        const textHeight = textContent.scrollHeight;
        const containerHeight = imagePreview.clientHeight;
        const footerHeight = parseFloat(getComputedStyle(footerBar).height);
        const availableHeight = containerHeight - footerHeight;
        
        // If text is too large, adjust padding to fit
        if (textHeight > availableHeight) {
            const topPadding = Math.max(10, (availableHeight - textHeight) / 2);
            textContent.style.paddingTop = `${topPadding}px`;
        } else {
            // Center text vertically
            textContent.style.paddingTop = '0';
        }
    }
    
    function updateLogoSize() {
        const size = logoSizeInput.value;
        logoSizeValue.textContent = `${size}px`;
        logoPreview.style.height = `${size}px`;
    }
    
    function updateFooterHeight() {
        // Make sure paddingBottom is set before calculating
        if (!imagePreview.style.paddingBottom) {
            imagePreview.style.paddingBottom = '100%'; // Default to square
        }
        
        // Update the footer height to 15% of the preview container
        const previewWidth = imagePreview.offsetWidth;
        const aspectRatio = parseFloat(imagePreview.style.paddingBottom) / 100;
        const previewHeight = previewWidth * aspectRatio;
        const footerHeight = previewHeight * 0.15;
        
        footerBar.style.height = `${footerHeight}px`;
        
        // Update text content bottom margin to account for footer
        textContent.style.bottom = `${footerHeight}px`;
        
        // Update logo size to fit footer
        if (logoPreview.src) {
            const logoHeight = footerHeight * 0.7; // 70% of footer height
            logoSizeInput.value = Math.round(logoHeight);
            logoSizeValue.textContent = `${Math.round(logoHeight)}px`;
            logoPreview.style.height = `${Math.round(logoHeight)}px`;
        }
        
        // Adjust text position to ensure it stays within bounds
        adjustTextPosition();
    }
    
    
    function updateImageSize() {
        const size = imageSizeSelect.value;
        let aspectRatio;
        
        switch (size) {
            case 'square':
                aspectRatio = '100%'; // 1:1
                break;
            case 'portrait':
                aspectRatio = '125%'; // 4:5
                break;
            case 'landscape':
                aspectRatio = '56.3%'; // 16:9
                break;
            case 'twitter':
                aspectRatio = '50%'; // 2:1
                break;
            case 'instagram':
                aspectRatio = '100%'; // 1:1 for Instagram
                break;
            case 'instagramreel':
                aspectRatio = '177.8%'; // 9:16 for Instagram Reel
                break;
            default:
                aspectRatio = '100%';
        }
        
        imagePreview.style.paddingBottom = aspectRatio;
        
        // Update footer height when image size changes
        updateFooterHeight();
    }
    
    function handleLogoUpload(e) {
        const file = e.target.files[0];
        
        if (file) {
            const reader = new FileReader();
            
            reader.onload = function(event) {
                logoImage = event.target.result;
                logoPreview.src = logoImage;
                logoPreview.style.display = 'block';
                
                // Update logo size to fit footer
                updateFooterHeight();
            };
            
            reader.readAsDataURL(file);
        }
    }
    
    function restorePreview() {
        // Reset the preview to its original state
        imagePreview.innerHTML = `
            <div id="text-content"></div>
            <div id="footer-bar">
                <img id="logo-preview" alt="Logo">
            </div>
        `;
        
        // Update references to the new elements
        textContent = document.getElementById('text-content');
        footerBar = document.getElementById('footer-bar');
        logoPreview = document.getElementById('logo-preview');
        
        // Restore styles and content
        imagePreview.style.backgroundColor = bgColor;
        imagePreview.style.height = '';
        imagePreview.style.paddingBottom = '100%'; // Default to square
        
        footerBar.style.backgroundColor = footerColor;
        textContent.style.color = textColor;
        textContent.style.fontWeight = fontWeightSelect.value;
        textContent.style.fontSize = `${fontSizeInput.value}px`;
        
        // Restore logo
        if (logoImage) {
            logoPreview.src = logoImage;
        } else if (defaultLogoImage) {
            logoPreview.src = defaultLogoImage;
        }
        logoPreview.style.display = 'block';
        
        // Update sizes
        updateImageSize();
        updatePreview();
        
        // Disable download button
        downloadBtn.disabled = true;
    }
    
    function generateImage() {
        // Create a canvas element
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        // Set canvas dimensions based on selected size
        let width, height;
        
        switch (imageSizeSelect.value) {
            case 'square':
                width = 1080;
                height = 1080;
                break;
            case 'portrait':
                width = 1080;
                height = 1350;
                break;
            case 'landscape':
                width = 1080;
                height = 608;
                break;
            case 'twitter':
                width = 1200;
                height = 600;
                break;
            case 'instagram':
                width = 1080;
                height = 1080;
                break;
            case 'instagramreel':
                width = 1080;
                height = 1920;
                break;
            default:
                width = 1080;
                height = 1080;
        }
        
        canvas.width = width;
        canvas.height = height;
        
        // Draw background
        ctx.fillStyle = bgColor;
        ctx.fillRect(0, 0, width, height);
        
        // Draw footer bar - now 15% of image height
const footerHeight = Math.round(height * 0.15); // Ensure this matches the CSS percentage
ctx.fillStyle = footerColor;
ctx.fillRect(0, height - footerHeight, width, footerHeight);

        
        // Draw text
        const text = textInput.value || 'ಇಲ್ಲಿ ನಿಮ್ಮ ಕನ್ನಡ ಪಠ್ಯ ಕಾಣಿಸುತ್ತದೆ';
        const fontSize = parseInt(fontSizeInput.value, 10);
        const fontWeight = fontWeightSelect.value;
        
        ctx.fillStyle = textColor;
        ctx.font = `${fontWeight} ${fontSize}px 'Baloo Tamma 2'`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        
        // Handle text wrapping and line breaks
        const maxWidth = width * 0.8; // 80% of image width
        const lineHeight = fontSize * 1.3;
        
        // Split text by line breaks first
        const paragraphs = text.split('\n');
        const lines = [];
        
        // Process each paragraph for word wrapping
        paragraphs.forEach(paragraph => {
            if (paragraph.trim() === '') {
                // Add empty line for paragraph breaks
                lines.push('');
                return;
            }
            
            const words = paragraph.split(' ');
            let currentLine = words[0];
            
            for (let i = 1; i < words.length; i++) {
                const testLine = currentLine + ' ' + words[i];
                const metrics = ctx.measureText(testLine);
                
                if (metrics.width > maxWidth) {
                    lines.push(currentLine);
                    currentLine = words[i];
                } else {
                    currentLine = testLine;
                }
            }
            
            lines.push(currentLine);
        });
        
        // Calculate vertical position for text - adjust for larger footer
        const textAreaHeight = height - footerHeight;
        const totalTextHeight = lines.length * lineHeight;
        let textY = (textAreaHeight / 2) - (totalTextHeight / 2) + (lineHeight / 2);
        
        // Ensure text doesn't overflow at the top
        textY = Math.max(fontSize / 2, textY);
        
        // Draw each line of text
        lines.forEach((line, index) => {
            ctx.fillText(line, width / 2, textY + index * lineHeight);
        });
        
        // Function to finalize the image after logo is drawn (or if no logo)
        function finalizeImage() {
            // Convert canvas to image
            currentImageUrl = canvas.toDataURL('image/png');
            
            // Create a container for the generated image
            const previewContainer = document.createElement('div');
            previewContainer.style.width = '100%';
            previewContainer.style.position = 'relative';
            previewContainer.style.borderRadius = 'var(--border-radius)';
            previewContainer.style.overflow = 'hidden';
            previewContainer.style.boxShadow = 'var(--shadow-lg)';
            
            // Display generated image
            const generatedImg = new Image();
            generatedImg.src = currentImageUrl;
            generatedImg.style.width = '100%';
            generatedImg.style.height = 'auto';
            generatedImg.style.display = 'block';
            
            previewContainer.appendChild(generatedImg);
            
            // Clear preview and append generated image
            while (imagePreview.firstChild) {
                imagePreview.removeChild(imagePreview.firstChild);
            }
            
            // Reset the padding-bottom since we now have an actual image
            imagePreview.style.height = 'auto';
            imagePreview.style.paddingBottom = '0';
            
            imagePreview.appendChild(previewContainer);
            
            // Add a reset button to restore the preview
            const resetButton = document.createElement('button');
            resetButton.type = 'button';
            resetButton.className = 'reset-preview-button';
            resetButton.innerHTML = 'Reset Preview';
            resetButton.style.position = 'absolute';
            resetButton.style.bottom = '10px';
            resetButton.style.right = '10px';
            resetButton.style.zIndex = '10';
            resetButton.style.padding = '8px 12px';
            resetButton.style.fontSize = '12px';
            resetButton.style.opacity = '0.8';
            
            resetButton.addEventListener('click', function() {
                restorePreview();
                previewContainer.remove();
                resetButton.remove();
            });
            
            previewContainer.appendChild(resetButton);
            
            // Enable download button
            downloadBtn.disabled = false;
        }
        
        // Determine which logo to use
        const logoSrc = logoImage || defaultLogoImage;
        
        // Draw logo if available
        if (logoSrc) {
            const logoImg = new Image();
            
            logoImg.onload = function() {
                const logoSize = parseInt(logoSizeInput.value, 10);
                
                // Limit logo height to 99% of footer height to prevent overflow
                const maxLogoHeight = footerHeight * 0.9;
                let logoHeight = logoSize;
                
                // Scale down logo if it's too large
                if (logoHeight > maxLogoHeight) {
                    logoHeight = maxLogoHeight;
                }
                
                const logoRatio = logoImg.width / logoImg.height;
                const logoWidth = logoHeight * logoRatio;
                
                // Center logo in footer bar
                const logoX = (width - logoWidth) / 2;
                const logoY = height - footerHeight + (footerHeight - logoHeight) / 2;
                
                ctx.drawImage(logoImg, logoX, logoY, logoWidth, logoHeight);
                
                finalizeImage();
            };
            
            logoImg.onerror = function() {
                console.warn('Failed to load logo for canvas');
                finalizeImage();
            };
            
            logoImg.src = logoSrc;
        } else {
            finalizeImage();
        }
    }
    
    function downloadImage(imageUrl) {
        const link = document.createElement('a');
        link.href = imageUrl;
        link.download = 'kannada-text-image.png';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
});
