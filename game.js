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
document.addEventListener('DOMContentLoaded', function() {
    console.log("DOM content loaded, initializing game...");

    // Hide the loading screen after a short delay
    const loadingScreen = document.getElementById('loading-screen');
    if (loadingScreen) {
        setTimeout(() => {
            loadingScreen.style.opacity = '0';
            setTimeout(() => {
                loadingScreen.style.display = 'none';
            }, 500);
        }, 800);
    }
    
    // Add game animations
    addGameAnimations();
    
    // Set up character selection
    setupCharacterSelection();
    
    // Initialize audio
    initializeAudio();

    // Auto-select first character after a short delay to help with testing
    setTimeout(() => {
        const firstCharacter = document.querySelector('.character');
        if (firstCharacter && !gameState.character) {
            firstCharacter.click();
        }
    }, 1000);
});

// Set up character selection
function setupCharacterSelection() {
    const characters = document.querySelectorAll('.character');
    const startButton = document.getElementById('start-game');
    
    if (startButton) {
        startButton.disabled = true;
        startButton.style.opacity = '0.7';
        startButton.style.cursor = 'not-allowed';
    }
    
    // Add click listeners to each character
    characters.forEach(character => {
        character.addEventListener('click', function() {
            // Play select sound if available
            if (window.playSound) {
                window.playSound('select');
            }
            
            // Remove selected class from all characters
            characters.forEach(c => c.classList.remove('selected'));
            
            // Add selected class to chosen character
            character.classList.add('selected');
            
            // Store selected character
            gameState.character = character.dataset.name;
            console.log("Selected character:", gameState.character);
            
            // Enable start button
            if (startButton) {
                startButton.disabled = false;
                startButton.style.cursor = 'pointer';
                startButton.style.opacity = '1';
            }
        });
    });
    
    // Set up start button click handler
    if (startButton) {
        startButton.onclick = function() {
            if (gameState.character) {
                // Play select sound if available
                if (window.playSound) {
                    window.playSound('select');
                }
                
                console.log("Starting game with character:", gameState.character);
                startGame();
            }
        };
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
    
    // Create a simple character representation
    const character = document.createElement('div');
    character.className = 'player-avatar';
    character.style.position = 'relative';
    character.style.width = '60px';
    character.style.height = '120px';
    
    // Set up the game area with a data center background
    setupDataCenterBackground();
    
    // Head
    const head = document.createElement('div');
    head.style.position = 'absolute';
    head.style.top = '0';
    head.style.left = '50%';
    head.style.transform = 'translateX(-50%)';
    head.style.width = '40px';
    head.style.height = '40px';
    head.style.backgroundColor = '#f5d5a0';
    head.style.borderRadius = '5px';
    character.appendChild(head);
    
    // Body
    const body = document.createElement('div');
    body.style.position = 'absolute';
    body.style.top = '40px';
    body.style.left = '50%';
    body.style.transform = 'translateX(-50%)';
    body.style.width = '30px';
    body.style.height = '40px';
    body.style.backgroundColor = '#5d4037';
    character.appendChild(body);
    
    // Legs
    const legs = document.createElement('div');
    legs.style.position = 'absolute';
    legs.style.top = '80px';
    legs.style.left = '50%';
    legs.style.transform = 'translateX(-50%)';
    legs.style.width = '30px';
    legs.style.height = '40px';
    legs.style.display = 'flex';
    legs.style.justifyContent = 'space-between';
    
    const leftLeg = document.createElement('div');
    leftLeg.style.width = '12px';
    leftLeg.style.height = '100%';
    leftLeg.style.backgroundColor = '#3d2314';
    legs.appendChild(leftLeg);
    
    const rightLeg = document.createElement('div');
    rightLeg.style.width = '12px';
    rightLeg.style.height = '100%';
    rightLeg.style.backgroundColor = '#3d2314';
    legs.appendChild(rightLeg);
    
    character.appendChild(legs);
    
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

// Create initial reports to get the game started
function createInitialReports() {
    // Create several reports immediately
    for (let i = 0; i < 5; i++) {
        setTimeout(() => {
            spawnReport();
        }, i * 300);
    }
}

// Spawn a new report
function spawnReport() {
    const gameArea = document.getElementById('game-area');
    if (!gameArea || !gameState.isPlaying) return;
    
    // Determine if this is a bad report (needs fixing) or good report
    const isBad = Math.random() < 0.6;
    
    // Create the report element
    const report = document.createElement('div');
    report.className = isBad ? 'bad-report' : 'good-report';
    report.style.position = 'absolute';
    report.style.width = '120px';
    report.style.height = '90px';
    report.style.backgroundColor = isBad ? '#e74c3c' : '#2ecc71'; // Red for bad, Green for good
    report.style.borderRadius = '3px';
    report.style.padding = '10px';
    report.style.boxShadow = isBad ? 
        '0 0 15px rgba(255, 0, 0, 0.7)' : 
        '0 0 15px rgba(46, 204, 113, 0.7)';
    report.style.color = 'white';
    report.style.fontWeight = 'bold';
    report.style.fontSize = '14px';
    report.style.cursor = isBad ? 'pointer' : 'default';
    report.style.zIndex = '100';
    
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
    
    report.innerHTML = `
        <div style="text-align: center; margin-bottom: 5px;">
            ${isBad ? '⚠️' : '✅'} ${randomService}
        </div>
        <div style="font-size: 12px; margin-top: 5px;">
            <div>Status: ${message}</div>
            <div>Region: us-west-${Math.floor(Math.random() * 3) + 1}</div>
        </div>
    `;
    
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
        // For bad reports, add click handler
        report.addEventListener('click', function() {
            // Skip if already handled
            if (this.classList.contains('fixed')) return;
            
            // Play success sound if available
            if (window.playSound) {
                window.playSound('success');
            }
            
            // Mark as fixed
            this.classList.add('fixed');
            this.style.backgroundColor = '#2ecc71'; // Green for fixed
            this.style.animation = 'none';
            this.innerHTML = `
                <div style="text-align: center; font-size: 24px;">
                    ✅
                </div>
                <div style="text-align: center; font-size: 16px;">
                    FIXED
                </div>
            `;
            
            // Add points and update score
            gameState.score += 10;
            gameState.fixedReports++;
            updateScore();
            
            // Fly to cloud after a moment
            setTimeout(() => {
                this.style.transition = 'all 1.5s ease-out';
                this.style.transform = 'translateY(-200px) scale(0.5)';
                this.style.opacity = '0';
                
                // Remove after animation completes
                setTimeout(() => {
                    if (this.parentNode) {
                        gameArea.removeChild(this);
                    }
                }, 1500);
            }, 500);
        });
        
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
        }, 5000);
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
    
    // Set up play again button
    const playAgainButton = document.getElementById('play-again');
    if (playAgainButton) {
        // Remove any existing event listeners by cloning the button
        const newButton = playAgainButton.cloneNode(true);
        if (playAgainButton.parentNode) {
            playAgainButton.parentNode.replaceChild(newButton, playAgainButton);
        }
        
        // Add new click handler
        newButton.onclick = function() {
            console.log("Play again clicked");
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
            0% { transform: scale(1); box-shadow: 0 0 10px rgba(255, 0, 0, 0.6); }
            100% { transform: scale(1.05); box-shadow: 0 0 20px rgba(255, 0, 0, 0.8); }
        }
        
        @keyframes report-float {
            0% { transform: translateY(0); }
            50% { transform: translateY(-5px); }
            100% { transform: translateY(0); }
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
    `;
    document.head.appendChild(style);
}