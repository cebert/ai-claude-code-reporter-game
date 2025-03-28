// Reporter Game Core Script
// This script handles the core gameplay for the Report Fixer game

// Global game state
const gameState = {
    character: null,
    score: 0,
    level: 1,
    fixedReports: 0,
    isPlaying: false,
    timeRemaining: 120, // 2 minutes
    spawnRate: 1500 // ms between report spawns
};

// Initialize the game when DOM is loaded
window.addEventListener('load', function() {
    console.log("Window loaded, initializing game...");

    // Force document to proper viewport on mobile
    const viewport = document.querySelector("meta[name=viewport]");
    if (viewport) {
        viewport.setAttribute('content', 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no');
    }

    // Apply mobile optimizations
    document.addEventListener('touchmove', function(e) {
        e.preventDefault();
    }, { passive: false });
    
    // Hide the loading screen after a brief delay to ensure all elements are ready
    setTimeout(function() {
        const loadingScreen = document.getElementById('loading-screen');
        if (loadingScreen) {
            loadingScreen.style.display = 'none';
        }
        
        try {
            // Basic setup - simplified for reliability
            addGameAnimations();
            setupCharacterSelection();
            initializeAudio();
        } catch (error) {
            console.error("Error during initialization:", error);
            // Continue anyway so the game is at least usable
        }
    }, 200); // Short delay to ensure DOM is fully ready
});

// Set up character selection - super simple version for reliability on mobile
function setupCharacterSelection() {
    try {
        const characters = document.querySelectorAll('.character');
        const startButton = document.getElementById('start-game');
        
        if (startButton) {
            // Reset button state
            startButton.disabled = true;
            startButton.style.opacity = '0.7';
        }
        
        // Set up basic click handlers on characters
        characters.forEach(character => {
            // Simple click handler
            character.onclick = function() {
                // Clear selected state from all characters
                characters.forEach(c => c.classList.remove('selected'));
                
                // Mark this character as selected
                this.classList.add('selected');
                
                // Store selected character
                gameState.character = this.dataset.name;
                
                // Enable start button
                if (startButton) {
                    startButton.disabled = false;
                    startButton.style.opacity = '1';
                }
            };
        });
        
        // Set up start button click handler
        if (startButton) {
            startButton.onclick = function() {
                if (gameState.character && !this.disabled) {
                    // Start the game
                    startGame();
                }
            };
        }
        
        // Auto-select first character
        if (characters.length > 0) {
            characters[0].classList.add('selected');
            gameState.character = characters[0].dataset.name;
            if (startButton) {
                startButton.disabled = false;
                startButton.style.opacity = '1';
            }
        }
    } catch (error) {
        console.error("Error in character selection:", error);
    }
}

// Start the game
function startGame() {
    console.log("Starting game with character:", gameState.character);
    
    // Hide start screen and show game screen
    const startScreen = document.getElementById('start-screen');
    const gameScreen = document.getElementById('game-screen');
    
    // Reset game state
    resetGame();
    
    // Make sure the game screen is visible before doing anything else
    if (startScreen) {
        startScreen.style.display = 'none';
        startScreen.classList.add('hidden');
    }
    
    if (gameScreen) {
        gameScreen.style.display = 'flex';
        gameScreen.classList.remove('hidden');
    }
    
    // Update character name display
    const characterNameDisplay = document.getElementById('character-name');
    if (characterNameDisplay) {
        characterNameDisplay.textContent = gameState.character || "Engineer";
    }
    
    // Add the player character
    addPlayerCharacter();
    
    // Double check that game objects exist
    const gameArea = document.getElementById('game-area');
    if (!gameArea) {
        console.error("Game area not found! Cannot start game.");
        return;
    }
    
    // Start the game
    gameState.isPlaying = true;
    console.log("Game started successfully");
    
    // Start background music if available
    if (window.gameAudio && window.gameAudio.background) {
        try {
            window.gameAudio.background.play().catch(e => {
                console.log("Could not play background music:", e);
            });
        } catch (error) {
            console.log("Error playing background music:", error);
        }
    }
    
    // Start timer
    const timer = setInterval(() => {
        gameState.timeRemaining--;
        updateTimerDisplay();
        
        if (gameState.timeRemaining <= 0) {
            clearInterval(timer);
            endGame();
        }
    }, 1000);
    
    // Start spawning reports
    createInitialReports();
    
    const spawnInterval = setInterval(() => {
        if (gameState.isPlaying) {
            spawnReport();
        } else {
            clearInterval(spawnInterval);
        }
    }, gameState.spawnRate);
    
    // Increase difficulty every 15 seconds
    const difficultyInterval = setInterval(() => {
        if (gameState.isPlaying) {
            increaseDifficulty();
        } else {
            clearInterval(difficultyInterval);
        }
    }, 15000);
}

// Add the player character to the game area
function addPlayerCharacter() {
    const playerCharEl = document.getElementById('player-character');
    if (!playerCharEl) return;
    
    // Clear any existing content
    playerCharEl.innerHTML = '';
    
    // Set up the game area with a data center background
    setupDataCenterBackground();
    
    // Create a Minecraft-style character similar to selection screen
    const character = document.createElement('div');
    character.className = 'minecraft-character player-avatar';
    character.style.position = 'relative';
    character.style.width = '60px';
    character.style.height = '120px';
    
    // Create character parts similar to the selection screen
    // Head
    const mcHead = document.createElement('div');
    mcHead.className = 'mc-head';
    mcHead.style.position = 'absolute';
    mcHead.style.top = '0';
    mcHead.style.left = '50%';
    mcHead.style.transform = 'translateX(-50%)';
    mcHead.style.width = '40px';
    mcHead.style.height = '40px';
    mcHead.style.borderRadius = '4px';
    mcHead.style.zIndex = '2';
    
    // Body
    const mcBody = document.createElement('div');
    mcBody.className = 'mc-body';
    mcBody.style.position = 'absolute';
    mcBody.style.top = '40px';
    mcBody.style.left = '50%';
    mcBody.style.transform = 'translateX(-50%)';
    mcBody.style.width = '30px';
    mcBody.style.height = '45px';
    mcBody.style.zIndex = '1';
    
    // Legs
    const mcLegs = document.createElement('div');
    mcLegs.className = 'mc-legs';
    mcLegs.style.position = 'absolute';
    mcLegs.style.top = '85px';
    mcLegs.style.left = '50%';
    mcLegs.style.transform = 'translateX(-50%)';
    mcLegs.style.width = '30px';
    mcLegs.style.height = '35px';
    mcLegs.style.display = 'flex';
    mcLegs.style.justifyContent = 'space-between';
    
    const leftLeg = document.createElement('div');
    leftLeg.style.width = '12px';
    leftLeg.style.height = '100%';
    leftLeg.style.backgroundColor = '#2c2c2c';
    mcLegs.appendChild(leftLeg);
    
    const rightLeg = document.createElement('div');
    rightLeg.style.width = '12px';
    rightLeg.style.height = '100%';
    rightLeg.style.backgroundColor = '#2c2c2c';
    mcLegs.appendChild(rightLeg);
    
    // Arms
    const mcArms = document.createElement('div');
    mcArms.className = 'mc-arms';
    mcArms.style.position = 'absolute';
    mcArms.style.top = '40px';
    mcArms.style.left = '50%';
    mcArms.style.transform = 'translateX(-50%)';
    mcArms.style.width = '50px';
    mcArms.style.height = '45px';
    mcArms.style.display = 'flex';
    mcArms.style.justifyContent = 'space-between';
    
    const leftArm = document.createElement('div');
    leftArm.style.width = '10px';
    leftArm.style.height = '100%';
    leftArm.style.backgroundColor = '#5d4037';
    mcArms.appendChild(leftArm);
    
    const rightArm = document.createElement('div');
    rightArm.style.width = '10px';
    rightArm.style.height = '100%';
    rightArm.style.backgroundColor = '#5d4037';
    mcArms.appendChild(rightArm);
    
    // Add face to the head
    const face = document.createElement('div');
    face.style.position = 'absolute';
    face.style.top = '0';
    face.style.left = '0';
    face.style.width = '100%';
    face.style.height = '100%';
    face.style.backgroundImage = `
        linear-gradient(to right, transparent 25%, #000 25%, #000 40%, transparent 40%, transparent 60%, #000 60%, #000 75%, transparent 75%),
        linear-gradient(to right, transparent 35%, #000 35%, #000 65%, transparent 65%)
    `;
    face.style.backgroundPosition = '0 40%, 0 70%';
    face.style.backgroundSize = '100% 15%, 100% 10%';
    face.style.backgroundRepeat = 'no-repeat';
    mcHead.appendChild(face);
    
    // Apply custom styling based on character selection
    customizeCharacter(mcHead, mcBody, mcArms, gameState.character);
    
    // Add parts to character
    character.appendChild(mcHead);
    character.appendChild(mcBody);
    character.appendChild(mcLegs);
    character.appendChild(mcArms);
    
    // Nameplate
    const nameplate = document.createElement('div');
    nameplate.style.position = 'absolute';
    nameplate.style.bottom = '-25px';
    nameplate.style.left = '50%';
    nameplate.style.transform = 'translateX(-50%)';
    nameplate.style.backgroundColor = 'rgba(0,0,0,0.7)';
    nameplate.style.color = 'white';
    nameplate.style.padding = '3px 8px';
    nameplate.style.borderRadius = '10px';
    nameplate.style.fontSize = '12px';
    nameplate.style.whiteSpace = 'nowrap';
    nameplate.textContent = gameState.character || "Player";
    character.appendChild(nameplate);
    
    // Add character to the game
    playerCharEl.appendChild(character);
}

// Function to customize character appearance based on selection
function customizeCharacter(head, body, arms, characterName) {
    // Default skin tone and colors
    let skinColor = '#f5d5a0';
    let shirtColor = '#5d4037';
    
    // Customize based on character
    switch(characterName) {
        case 'Ben':
            // Default colors
            break;
        case 'Zach':
            skinColor = '#f8dcbb';
            shirtColor = '#3498db';
            // Add glasses
            const zachGlasses = document.createElement('div');
            zachGlasses.style.position = 'absolute';
            zachGlasses.style.top = '40%';
            zachGlasses.style.left = '15%';
            zachGlasses.style.width = '70%';
            zachGlasses.style.height = '15%';
            zachGlasses.style.border = '2px solid #333';
            zachGlasses.style.borderRadius = '2px';
            zachGlasses.style.zIndex = '5';
            head.appendChild(zachGlasses);
            break;
        case 'Arpitha':
            skinColor = '#c99572';
            shirtColor = '#b13cad';
            // Add dark hair
            const arpithaHair = document.createElement('div');
            arpithaHair.style.position = 'absolute';
            arpithaHair.style.top = '0';
            arpithaHair.style.left = '0';
            arpithaHair.style.width = '100%';
            arpithaHair.style.height = '20%';
            arpithaHair.style.backgroundColor = '#222222';
            arpithaHair.style.zIndex = '2';
            head.appendChild(arpithaHair);
            break;
        case 'Michael':
            skinColor = '#e9c9a0';
            shirtColor = '#e74c3c';
            // Add glasses and grey hair
            const michaelGlasses = document.createElement('div');
            michaelGlasses.style.position = 'absolute';
            michaelGlasses.style.top = '40%';
            michaelGlasses.style.left = '15%';
            michaelGlasses.style.width = '70%';
            michaelGlasses.style.height = '15%';
            michaelGlasses.style.border = '2px solid #333';
            michaelGlasses.style.borderRadius = '2px';
            michaelGlasses.style.zIndex = '5';
            head.appendChild(michaelGlasses);
            
            const michaelHair = document.createElement('div');
            michaelHair.style.position = 'absolute';
            michaelHair.style.top = '0';
            michaelHair.style.left = '0';
            michaelHair.style.width = '100%';
            michaelHair.style.height = '20%';
            michaelHair.style.backgroundColor = '#aaaaaa';
            michaelHair.style.zIndex = '2';
            head.appendChild(michaelHair);
            break;
        case 'Chris':
            skinColor = '#f5e0c1';
            shirtColor = '#232f3e';
            break;
        case 'Rodolfo':
            skinColor = '#cfaa81';
            shirtColor = '#f39c12';
            // Add dark hair and beard
            const rodolfoHair = document.createElement('div');
            rodolfoHair.style.position = 'absolute';
            rodolfoHair.style.top = '0';
            rodolfoHair.style.left = '0';
            rodolfoHair.style.width = '100%';
            rodolfoHair.style.height = '20%';
            rodolfoHair.style.backgroundColor = '#222222';
            rodolfoHair.style.zIndex = '2';
            head.appendChild(rodolfoHair);
            
            const rodolfoBeard = document.createElement('div');
            rodolfoBeard.style.position = 'absolute';
            rodolfoBeard.style.bottom = '0';
            rodolfoBeard.style.left = '30%';
            rodolfoBeard.style.width = '40%';
            rodolfoBeard.style.height = '15%';
            rodolfoBeard.style.backgroundColor = '#222222';
            rodolfoBeard.style.zIndex = '3';
            head.appendChild(rodolfoBeard);
            break;
        default:
            // Default colors
            break;
    }
    
    // Apply the colors
    head.style.backgroundColor = skinColor;
    body.style.backgroundColor = shirtColor;
    
    // Update arms to match shirt color
    const armElements = arms.querySelectorAll('div');
    armElements.forEach(arm => {
        arm.style.backgroundColor = shirtColor;
    });
}

// Create initial reports to get the game started
function createInitialReports() {
    // Create several reports immediately
    for (let i = 0; i < 5; i++) {
        setTimeout(() => {
            spawnReport();
        }, i * 300);
    }
}

// Setup a data center background with racks of computers
function setupDataCenterBackground() {
    const gameArea = document.getElementById('game-area');
    if (!gameArea) return;
    
    // Clear any existing content except player character
    const playerChar = document.getElementById('player-character');
    const existingContent = Array.from(gameArea.children);
    existingContent.forEach(child => {
        if (child.id !== 'player-character') {
            gameArea.removeChild(child);
        }
    });
    
    // Add cloud
    const cloud = document.createElement('div');
    cloud.id = 'aws-cloud';
    cloud.className = 'cloud';
    cloud.style.position = 'absolute';
    cloud.style.top = '20px';
    cloud.style.left = '50%';
    cloud.style.transform = 'translateX(-50%)';
    cloud.style.width = '280px';
    cloud.style.height = '80px';
    cloud.style.zIndex = '1000';
    
    // Create cloud content with better layout
    const cloudIcon = document.createElement('div');
    cloudIcon.className = 'cloud-icon';
    cloudIcon.textContent = '☁️';
    
    const cloudText = document.createElement('div');
    cloudText.className = 'cloud-text';
    cloudText.innerHTML = 'CLOUD STORAGE';
    
    cloud.appendChild(cloudIcon);
    cloud.appendChild(cloudText);
    
    gameArea.appendChild(cloud);
    
    // Create server rack rows
    const rackRows = 3;
    const racksPerRow = 5;
    
    for (let row = 0; row < rackRows; row++) {
        for (let i = 0; i < racksPerRow; i++) {
            // Create server rack
            const rack = document.createElement('div');
            rack.className = 'server-rack';
            rack.style.position = 'absolute';
            rack.style.width = '70px';
            rack.style.height = '140px';
            rack.style.backgroundColor = '#1c232e';
            rack.style.border = '2px solid #252f40';
            rack.style.borderRadius = '3px';
            rack.style.top = `${120 + row * 160}px`;
            rack.style.left = `${50 + i * 120}px`;
            rack.style.zIndex = '2';
            
            // Add blinking lights
            for (let j = 0; j < 6; j++) {
                const light = document.createElement('div');
                light.className = 'server-light';
                light.style.position = 'absolute';
                light.style.width = '6px';
                light.style.height = '6px';
                light.style.borderRadius = '50%';
                light.style.top = `${10 + j * 20}px`;
                light.style.right = '10px';
                
                const colors = ['#55ff55', '#ff5555', '#55aaff'];
                light.style.backgroundColor = colors[j % colors.length];
                light.style.boxShadow = `0 0 5px ${colors[j % colors.length]}`;
                light.style.animation = 'blink 1.5s infinite alternate';
                light.style.animationDelay = `${Math.random() * 2}s`;
                
                rack.appendChild(light);
            }
            
            // Add rack to game area
            gameArea.appendChild(rack);
        }
    }
}

// Spawn a new report
function spawnReport() {
    const gameArea = document.getElementById('game-area');
    if (!gameArea || !gameState.isPlaying) return;
    
    // Determine if this is a bad report (needs fixing) or good report
    const isBad = Math.random() < 0.6;
    
    // Create the report element with responsive sizing
    const report = document.createElement('div');
    report.className = isBad ? 'bad-report' : 'good-report';
    report.style.position = 'absolute';
    
    // Adjust size for mobile devices
    const isMobile = window.innerWidth < 480;
    const reportWidth = isMobile ? '130px' : '130px'; // Increased width for mobile
    const reportHeight = isMobile ? '170px' : '160px'; // Increased height for mobile
    const fontSize = isMobile ? '13px' : '14px'; // Slightly larger font for mobile
    
    report.style.width = reportWidth;
    report.style.height = reportHeight;
    report.style.backgroundColor = 'white';
    report.style.borderRadius = '3px';
    report.style.padding = isMobile ? '8px' : '10px';
    report.style.boxShadow = isBad ? 
        '0 0 15px rgba(255, 0, 0, 0.7)' : 
        '0 0 15px rgba(46, 204, 113, 0.7)';
    report.style.color = '#333';
    report.style.fontWeight = 'bold';
    report.style.fontSize = fontSize;
    report.style.cursor = isBad ? 'pointer' : 'default';
    report.style.zIndex = '100';
    
    // Make reports better targets on mobile for easier tapping
    if (isMobile) {
        report.style.touchAction = 'manipulation';
        
        // For bad reports that need to be fixed, add extra visual cues and a larger tap target
        if (isBad) {
            // Add pseudo-element to increase tap area (invisible larger target)
            report.style.position = 'relative';
            
            // Make bad reports more noticeable on mobile
            report.style.boxShadow = '0 0 20px rgba(255, 0, 0, 0.9)';
            report.style.border = '2px solid rgba(255, 0, 0, 0.8)';
        }
    }
    
    // Add paper texture and corner fold
    report.style.backgroundImage = 'linear-gradient(to bottom, rgba(0,0,0,0.05) 1px, transparent 1px)';
    report.style.backgroundSize = '100% 20px';
    
    // Add a colored status tag at the top
    const statusTag = document.createElement('div');
    statusTag.style.position = 'absolute';
    statusTag.style.top = '0';
    statusTag.style.left = '0';
    statusTag.style.width = '100%';
    statusTag.style.height = '25px';
    statusTag.style.backgroundColor = isBad ? '#e74c3c' : '#2ecc71';
    statusTag.style.borderTopLeftRadius = '3px';
    statusTag.style.borderTopRightRadius = '3px';
    statusTag.style.color = 'white';
    statusTag.style.textAlign = 'center';
    statusTag.style.lineHeight = '25px';
    statusTag.style.fontSize = '12px';
    statusTag.style.fontWeight = 'bold';
    statusTag.textContent = isBad ? 'STUCK REPORT' : 'GOOD REPORT';
    report.appendChild(statusTag);
    
    // Create the folded corner effect
    const cornerFold = document.createElement('div');
    cornerFold.style.position = 'absolute';
    cornerFold.style.top = '0';
    cornerFold.style.right = '0';
    cornerFold.style.width = '25px';
    cornerFold.style.height = '25px';
    cornerFold.style.background = 'linear-gradient(135deg, transparent 50%, #f0f0f0 50%)';
    cornerFold.style.borderTopRightRadius = '3px';
    report.appendChild(cornerFold);
    
    // Position randomly (avoid top area)
    const gameAreaRect = gameArea.getBoundingClientRect();
    const top = 100 + Math.random() * (gameAreaRect.height - 200);
    const left = 20 + Math.random() * (gameAreaRect.width - 160);
    
    report.style.top = `${top}px`;
    report.style.left = `${left}px`;
    
    // Report content
    const services = ['EC2', 'S3', 'Lambda', 'DynamoDB', 'API Gateway'];
    const randomService = services[Math.floor(Math.random() * services.length)];
    
    const badMessages = ['Connection Error', 'Service Error', 'Timeout', 'Failed', 'Critical Error'];
    const goodMessages = ['Running', 'Complete', 'Healthy', 'Success', 'Ready'];
    
    const message = isBad ? 
        badMessages[Math.floor(Math.random() * badMessages.length)] : 
        goodMessages[Math.floor(Math.random() * goodMessages.length)];
    
    // Create the report content - responsive for mobile
    const contentDiv = document.createElement('div');
    contentDiv.style.marginTop = '30px';
    contentDiv.style.position = 'relative';
    contentDiv.style.height = 'calc(100% - 30px)';
    
    // Simplify report content for mobile
    if (isMobile) {
        contentDiv.innerHTML = `
            <div style="text-align: center; margin: 5px 0; font-size: 14px; font-weight: bold;">
                ${randomService}
            </div>
            <div style="font-size: 11px; margin-top: 10px; text-align: left;">
                <div style="margin-bottom: 4px; display: flex; justify-content: space-between;">
                    <span>Status:</span> 
                    <span style="color: ${isBad ? '#e74c3c' : '#2ecc71'}; font-weight: bold;">${message}</span>
                </div>
                <div style="margin-bottom: 4px; display: flex; justify-content: space-between;">
                    <span>Region:</span> 
                    <span>us-w${Math.floor(Math.random() * 3) + 1}</span>
                </div>
                <div style="margin-bottom: 4px; display: flex; justify-content: space-between;">
                    <span>ID:</span> 
                    <span>${Math.floor(Math.random() * 10000)}</span>
                </div>
            </div>
            <div style="position: absolute; bottom: 5px; width: 100%; text-align: center; font-size: 9px; color: #888;">
                ${isBad ? 'Action Required' : 'OK'}
            </div>
        `;
    } else {
        contentDiv.innerHTML = `
            <div style="text-align: center; margin: 8px 0; font-size: 16px; font-weight: bold;">
                ${randomService} Report
            </div>
            <div style="font-size: 12px; margin-top: 15px; text-align: left;">
                <div style="margin-bottom: 6px; display: flex; justify-content: space-between;">
                    <span>Status:</span> 
                    <span style="color: ${isBad ? '#e74c3c' : '#2ecc71'}; font-weight: bold;">${message}</span>
                </div>
                <div style="margin-bottom: 6px; display: flex; justify-content: space-between;">
                    <span>Region:</span> 
                    <span>us-west-${Math.floor(Math.random() * 3) + 1}</span>
                </div>
                <div style="margin-bottom: 6px; display: flex; justify-content: space-between;">
                    <span>Time:</span> 
                    <span>${new Date().toLocaleTimeString()}</span>
                </div>
                <div style="margin-bottom: 6px; display: flex; justify-content: space-between;">
                    <span>ID:</span> 
                    <span>RPT-${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}</span>
                </div>
            </div>
            <div style="position: absolute; bottom: 10px; width: 100%; text-align: center; font-size: 10px; color: #888;">
                ${isBad ? 'Action Required' : 'No Action Needed'}
            </div>
        `;
    }
    
    report.appendChild(contentDiv);
    
    // Add the report to the game area
    gameArea.appendChild(report);
    
    // Set animations via CSS classes
    if (isBad) {
        report.style.animation = 'report-pulse 0.8s infinite alternate';
    } else {
        report.style.animation = 'report-float 3s infinite ease-in-out';
    }
    
    // If it's a good report, let it auto-fly to cloud after a delay
    if (!isBad) {
        setTimeout(() => {
            if (report.parentNode) {
                // Fly to cloud animation
                report.style.transition = 'all 1.5s ease-out';
                report.style.transform = 'translateY(-200px) scale(0.5)';
                report.style.opacity = '0';
                
                // Remove after animation
                setTimeout(() => {
                    if (report.parentNode) {
                        gameArea.removeChild(report);
                    }
                }, 1500);
            }
        }, 2000 + Math.random() * 1000);
    } else {
        // For bad reports, add click/touch handlers for better mobile response
        const handleReportFix = function(e) {
            // Prevent any default behavior
            if (e) {
                e.preventDefault();
                e.stopPropagation();
            }
            
            // Skip if already handled
            if (report.classList.contains('fixed')) return;
            
            // Play success sound if available
            if (window.playSound) {
                window.playSound('success');
            }
            
            // Mark as fixed
            report.classList.add('fixed');
            report.style.backgroundColor = 'white';
            report.style.animation = 'none';
            
            // Clear existing content
            report.innerHTML = '';
            
            // Add stamped "FIXED" message
            const stamp = document.createElement('div');
            stamp.style.position = 'absolute';
            stamp.style.top = '50%';
            stamp.style.left = '50%';
            stamp.style.transform = 'translate(-50%, -50%) rotate(-25deg)';
            stamp.style.border = '4px solid #2ecc71';
            stamp.style.borderRadius = '10px';
            stamp.style.padding = '5px 15px';
            stamp.style.color = '#2ecc71';
            stamp.style.fontSize = isMobile ? '20px' : '28px';
            stamp.style.fontWeight = 'bold';
            stamp.style.textTransform = 'uppercase';
            stamp.style.textAlign = 'center';
            stamp.style.letterSpacing = '2px';
            stamp.textContent = 'FIXED';
            report.appendChild(stamp);
            
            // Add points and update score
            gameState.score += 10;
            gameState.fixedReports++;
            updateScore();
            
            // Fly to cloud after a moment
            setTimeout(() => {
                report.style.transition = 'all 1.5s ease-out';
                report.style.transform = 'translateY(-200px) scale(0.5)';
                report.style.opacity = '0';
                
                // Remove after animation completes
                setTimeout(() => {
                    if (report.parentNode) {
                        gameArea.removeChild(report);
                    }
                }, 1500);
            }, 500);
        };
        
        // Add both click and touch handlers with better mobile support
        report.addEventListener('click', handleReportFix);
        
        // Add touch handlers with better support for mobile devices
        report.addEventListener('touchstart', function(e) {
            e.preventDefault(); // Prevent default touch behavior
            // Set data attribute to track touch
            report.setAttribute('data-touch-started', 'true');
        }, { passive: false });
        
        report.addEventListener('touchend', function(e) {
            e.preventDefault(); // Prevent default behavior
            // Only fire if touch started on this element
            if (report.getAttribute('data-touch-started') === 'true') {
                report.removeAttribute('data-touch-started');
                handleReportFix(e);
            }
        }, { passive: false });
        
        // Cancel the touch if moved too far
        report.addEventListener('touchmove', function(e) {
            report.removeAttribute('data-touch-started');
        }, { passive: true });
        
        // Add expiration for bad reports - they disappear if not fixed
        setTimeout(() => {
            if (report.parentNode && !report.classList.contains('fixed')) {
                // Fade out
                report.style.transition = 'all 0.5s ease-in-out';
                report.style.opacity = '0';
                
                // Remove after fade out
                setTimeout(() => {
                    if (report.parentNode) {
                        gameArea.removeChild(report);
                    }
                }, 500);
            }
        }, 5000); // 5 seconds to fix reports
    }
}

// Update score display
function updateScore() {
    const scoreDisplay = document.getElementById('score');
    if (scoreDisplay) {
        scoreDisplay.textContent = `Score: ${gameState.score}`;
    }
}

// Update timer display
function updateTimerDisplay() {
    const timerDisplay = document.getElementById('timer');
    if (!timerDisplay) return;
    
    const minutes = Math.floor(gameState.timeRemaining / 60);
    const seconds = gameState.timeRemaining % 60;
    timerDisplay.textContent = `Time: ${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
    
    // Add visual warning when time is running low
    if (gameState.timeRemaining <= 30) {
        timerDisplay.style.color = 'red';
    } else if (gameState.timeRemaining <= 60) {
        timerDisplay.style.color = '#ff9900';
    }
}

// Increase difficulty
function increaseDifficulty() {
    // Increase level
    gameState.level++;
    
    // Update level display
    const levelDisplay = document.getElementById('level');
    if (levelDisplay) {
        levelDisplay.textContent = `Level: ${gameState.level}`;
        
        // Highlight level up
        levelDisplay.style.color = '#ff9900';
        setTimeout(() => {
            levelDisplay.style.color = '';
        }, 1000);
    }
    
    // Make reports spawn faster
    gameState.spawnRate = Math.max(800, gameState.spawnRate - 100);
}

// End the game
function endGame() {
    console.log("Game over. Final score:", gameState.score);
    
    // Stop the game
    gameState.isPlaying = false;
    
    // Hide game screen and show game over screen
    const gameScreen = document.getElementById('game-screen');
    const gameOverScreen = document.getElementById('game-over');
    
    if (gameScreen) {
        gameScreen.classList.add('hidden');
        gameScreen.style.display = 'none';
    }
    
    if (gameOverScreen) {
        gameOverScreen.classList.remove('hidden');
        gameOverScreen.style.display = 'flex';
    }
    
    // Update final score and stats
    const finalScore = document.getElementById('final-score');
    const reportsFixed = document.getElementById('reports-fixed');
    const levelsCompleted = document.getElementById('levels-completed');
    
    if (finalScore) finalScore.textContent = `Final Score: ${gameState.score}`;
    if (reportsFixed) reportsFixed.textContent = gameState.fixedReports;
    if (levelsCompleted) levelsCompleted.textContent = gameState.level;
    
    // Set up play again button - simplified version
    const playAgainButton = document.getElementById('play-again');
    if (playAgainButton) {
        playAgainButton.onclick = function() {
            // Go back to start screen
            if (gameOverScreen) {
                gameOverScreen.classList.add('hidden');
                gameOverScreen.style.display = 'none';
            }
            
            const startScreen = document.getElementById('start-screen');
            if (startScreen) {
                startScreen.classList.remove('hidden');
                startScreen.style.display = 'flex';
            }
            
            resetGame();
        };
    }
}

// Reset the game
function resetGame() {
    // Reset game state
    gameState.score = 0;
    gameState.level = 1;
    gameState.fixedReports = 0;
    gameState.timeRemaining = 120;
    gameState.isPlaying = false;
    gameState.spawnRate = 1500;
    
    // Reset displays
    const scoreDisplay = document.getElementById('score');
    const levelDisplay = document.getElementById('level');
    const timerDisplay = document.getElementById('timer');
    
    if (scoreDisplay) scoreDisplay.textContent = 'Score: 0';
    if (levelDisplay) levelDisplay.textContent = 'Level: 1';
    if (timerDisplay) {
        timerDisplay.textContent = 'Time: 2:00';
        timerDisplay.style.color = '';
    }
    
    // Clear the game area of reports
    const gameArea = document.getElementById('game-area');
    if (gameArea) {
        const reports = gameArea.querySelectorAll('.bad-report, .good-report');
        reports.forEach(report => {
            if (report.parentNode) {
                gameArea.removeChild(report);
            }
        });
    }
}

// Initialize audio
function initializeAudio() {
    // Create a global audio object to store our sounds
    window.gameAudio = {
        background: null,
        success: null,
        failure: null,
        levelUp: null,
        select: null,
        loaded: false
    };

    // Try to load each sound
    try {
        // Background music
        const backgroundAudio = new Audio('sounds/background.mp3');
        backgroundAudio.loop = true;
        backgroundAudio.volume = 0.3;
        window.gameAudio.background = backgroundAudio;
        
        // Success sound
        window.gameAudio.success = new Audio('sounds/success.mp3');
        window.gameAudio.success.volume = 0.5;
        
        // Failure sound
        window.gameAudio.failure = new Audio('sounds/failure.mp3');
        window.gameAudio.failure.volume = 0.6;
        
        // Level up sound
        window.gameAudio.levelUp = new Audio('sounds/level-up.mp3');
        window.gameAudio.levelUp.volume = 0.7;
        
        // Select sound
        window.gameAudio.select = new Audio('sounds/select.mp3');
        window.gameAudio.select.volume = 0.4;
        
        // Mark as loaded
        window.gameAudio.loaded = true;
    } catch (error) {
        console.log("Error loading audio:", error);
        // Game will continue without audio
    }
    
    // Function to play a sound
    window.playSound = function(sound) {
        if (window.gameAudio && window.gameAudio.loaded && window.gameAudio[sound]) {
            try {
                window.gameAudio[sound].currentTime = 0;
                window.gameAudio[sound].play().catch(e => console.log("Audio play error:", e));
            } catch (error) {
                console.log("Error playing sound:", error);
            }
        }
    };
}

// Add game animations
function addGameAnimations() {
    console.log("Adding game animations...");
    
    const style = document.createElement('style');
    style.id = 'game-animations';
    style.textContent = `
        @keyframes report-pulse {
            0% { transform: scale(1) rotate(0deg); box-shadow: 0 0 10px rgba(255, 0, 0, 0.6); }
            100% { transform: scale(1.05) rotate(2deg); box-shadow: 0 0 20px rgba(255, 0, 0, 0.8); }
        }
        
        @keyframes report-float {
            0% { transform: translateY(0) rotate(0deg); }
            50% { transform: translateY(-5px) rotate(-1deg); }
            100% { transform: translateY(0) rotate(0deg); }
        }
        
        #player-character {
            position: absolute;
            bottom: 50px;
            left: 50%;
            transform: translateX(-50%);
            animation: character-bounce 2s infinite ease-in-out;
            z-index: 100;
        }
        
        @keyframes character-bounce {
            0%, 100% { transform: translateX(-50%) translateY(0); }
            50% { transform: translateX(-50%) translateY(-5px); }
        }
        
        .bad-report {
            animation: report-pulse 0.8s infinite alternate;
        }
        
        .good-report {
            animation: report-float 3s infinite ease-in-out;
        }
        
        @keyframes blink {
            0% { opacity: 0.3; }
            100% { opacity: 1; }
        }
    `;
    document.head.appendChild(style);
}