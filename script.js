// Global variables for Firebase configuration and authentication token
const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';
const firebaseConfig = typeof __firebase_config !== 'undefined' ? JSON.parse(__firebase_config) : {};
const initialAuthToken = typeof __initial_auth_token !== 'undefined' ? __initial_auth_token : null;

// Import necessary Firebase modules
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-app.js";
import { getAuth, signInAnonymously, signInWithCustomToken, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js";
import { getFirestore, doc, getDoc, setDoc, onSnapshot, collection } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js";

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

let userId = null; // Will store the current user's ID

// Authenticate the user and get their ID
async function authenticateUser() {
    try {
        if (initialAuthToken) {
            await signInWithCustomToken(auth, initialAuthToken);
        } else {
            await signInAnonymously(auth);
        }
        userId = auth.currentUser?.uid || crypto.randomUUID(); // Use UID if authenticated, else a random ID
        console.log("Firebase initialized. User ID:", userId);
    } catch (error) {
        console.error("Firebase authentication error:", error);
    }
}

// Wait for authentication before proceeding
onAuthStateChanged(auth, async (user) => {
    if (user) {
        userId = user.uid;
        console.log("Auth state changed. User ID:", userId);
    } else {
        console.log("No user signed in (or signed out).");
        await authenticateUser();
    }
});

// --- Game Logic ---

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const uiEffectsCanvas = document.getElementById('uiEffectsCanvas');
const uiCtx = uiEffectsCanvas.getContext('2d');

const player1HealthBarFill = document.querySelector('#player1Health .health-fill');
const player1HealthBarLayer2 = document.querySelector('#player1Health .health-fill-layer2');
const player2HealthBarFill = document.querySelector('#player2Health .health-fill');
const player2HealthBarLayer2 = document.querySelector('#player2Health .health-fill-layer2');
const player1ResourceContainer = document.getElementById('player1Resource');
const player2ResourceContainer = document.getElementById('player2Resource');
const player1UltimateCanvas = document.getElementById('player1UltimateCanvas');
const player1UltimateCtx = player1UltimateCanvas.getContext('2d');
const player2UltimateCanvas = document.getElementById('player2UltimateCanvas');
const player2UltimateCtx = player2UltimateCanvas.getContext('2d');
const player1TeleportChargesUI = document.getElementById('player1TeleportCharges');
const player2TeleportChargesUI = document.getElementById('player2TeleportCharges');
const player1SingleTeleportUI = document.getElementById('player1SingleTeleport');
const player2SingleTeleportUI = document.getElementById('player2SingleTeleport');
const player1AwakeningIndicator = document.getElementById('player1AwakeningIndicator');
const player2AwakeningIndicator = document.getElementById('player2AwakeningIndicator');
const player1AwakeningPlus = document.getElementById('player1AwakeningPlus');
const player2AwakeningPlus = document.getElementById('player2AwakeningPlus');


const gameOverScreen = document.getElementById('gameOverScreen');
const gameOverText = document.getElementById('gameOverText');
const restartButton = document.getElementById('restartButton');
const pauseScreen = document.getElementById('pauseScreen');
const fullscreenBtn = document.getElementById('fullscreenBtn');
const musicToggleBtn = document.getElementById('musicToggleBtn');
const sfxToggleBtn = document.getElementById('sfxToggleBtn');
const pauseQuitButton = document.getElementById('pauseQuitButton');
const gameOverQuitButton = document.getElementById('gameOverQuitButton');
const quitConfirmationModal = document.getElementById('quitConfirmationModal');
const quitConfirmYes = document.getElementById('quitConfirmYes');
const quitConfirmNo = document.getElementById('quitConfirmNo');

// Menu Screen elements
const titleScreen = document.getElementById('titleScreen');
const startScreen = document.getElementById('startScreen');
const onePlayerButton = document.getElementById('onePlayerButton'); 
const twoPlayerButton = document.getElementById('twoPlayerButton'); 
const startMusicToggleBtn = document.getElementById('startMusicToggleBtn');
const startSfxToggleBtn = document.getElementById('startSfxToggleBtn');
const gameSpeedSlider = document.getElementById('gameSpeedSlider');
const gameSpeedValueDisplay = document.getElementById('gameSpeedValue');
// Pause Screen speed elements
const pauseGameSpeedSlider = document.getElementById('pauseGameSpeedSlider');
const pauseGameSpeedValueDisplay = document.getElementById('pauseGameSpeedValue');

// Audio elements
const mainMenuMusic1 = document.getElementById('mainMenuMusic1');
const mainMenuMusic2 = document.getElementById('mainMenuMusic2');
const fightMusic1 = document.getElementById('fightMusic1');
const fightMusic2 = document.getElementById('fightMusic2');
const beginSfx = document.getElementById('beginSfx');
const jumpSfx = document.getElementById('jumpSfx');
const landSfx = document.getElementById('landSfx');
const takeHitSfx = document.getElementById('takeHitSfx');
const burnSfx = document.getElementById('burnSfx');
const duckSfx = document.getElementById('duckSfx');
const dashSfx = document.getElementById('dashSfx');
const fireballSfx = document.getElementById('fireballSfx');
const fireballHitSfx = document.getElementById('fireballHitSfx');
const fireballClashSfx = document.getElementById('fireballClashSfx');
const laserSfx = document.getElementById('laserSfx');
const laserAwakenedSfx = document.getElementById('laserAwakenedSfx');
const laserClashSfx = document.getElementById('laserClashSfx');
const lightningSfx = document.getElementById('lightningSfx');
const lightningAwakenedSfx = document.getElementById('lightningAwakenedSfx');
const kamehamehaChargeSfx = document.getElementById('kamehamehaChargeSfx');
const kamehamehaLvl1Sfx = document.getElementById('kamehamehaLvl1Sfx');
const kamehamehaLvl2Sfx = document.getElementById('kamehamehaLvl2Sfx');
const kamehamehaLvl3Sfx = document.getElementById('kamehamehaLvl3Sfx');
const kamehamehaClashLoopSfx = document.getElementById('kamehamehaClashLoopSfx');
const kamehamehaClashLvl2EndSfx = document.getElementById('kamehamehaClashLvl2EndSfx');
const kamehamehaClashLvl3EndSfx = document.getElementById('kamehamehaClashLvl3EndSfx');
const ultimateSfx = document.getElementById('ultimateSfx');
const teleportSfx = document.getElementById('teleportSfx');
const teleportAwakenedSfx = document.getElementById('teleportAwakenedSfx');
const blockUpSfx = document.getElementById('blockUpSfx');
const blockDownSfx = document.getElementById('blockDownSfx');
const shieldHitPhysicalSfx = document.getElementById('shieldHitPhysicalSfx');
const shieldHitFireballSfx = document.getElementById('shieldHitFireballSfx');
const shieldHitLaserSfx = document.getElementById('shieldHitLaserSfx');
const awakening1Sfx = document.getElementById('awakening1Sfx');
const awakening2Sfx = document.getElementById('awakening2Sfx');
const awakeningEndSfx = document.getElementById('awakeningEndSfx');
const yellowHealthSfx = document.getElementById('yellowHealthSfx');
const redHealthSfx = document.getElementById('redHealthSfx');
const deathSfx = document.getElementById('deathSfx');
const gameOverSfx = document.getElementById('gameOverSfx');
const iceballSfx = document.getElementById('iceballSfx');
const iceballHitSfx = document.getElementById('iceballHitSfx');
const iceballClashSfx = document.getElementById('iceballClashSfx');
const iceWallHitSfx = document.getElementById('iceWallHitSfx');
const iceWallStrongHitSfx = document.getElementById('iceWallStrongHitSfx');
const iceWallBreakSfx = document.getElementById('iceWallBreakSfx');
const iceWallLoopSfx = document.getElementById('iceWallLoopSfx');
const greenHealthRegenSfx = document.getElementById('greenHealthRegenSfx');
const midAttackSfx = document.getElementById('midAttackSfx');
const midAttackAwakenedSfx = document.getElementById('midAttackAwakenedSfx');
const lowAttackSfx = document.getElementById('lowAttackSfx');
const lowAttackAwakenedSfx = document.getElementById('lowAttackAwakenedSfx');

// Game Constants (base values, will be scaled by gameSpeedMultiplier)
const BASE_GRAVITY = 0.85;
const BASE_JUMP_VELOCITY = -16;
const BASE_MOVE_SPEED = 7;
const BASE_DASH_SPEED = 21;
const BASE_DASH_DURATION = 175; 
const BASE_DASH_COOLDOWN = 1250;
const DOUBLE_TAP_WINDOW = 220;
const BASIC_ATTACK_DURATION = 200;
const BASIC_ATTACK_DAMAGE = 10;
const MAX_HEALTH = 250; 
const YELLOW_HEALTH_SEGMENT = 150; 
const GREEN_HEALTH_SEGMENT = MAX_HEALTH - YELLOW_HEALTH_SEGMENT; 
const DUCK_HEIGHT_MULTIPLIER = 0.3;
const BASE_TELEPORT_CHARGE_TIME = 20000;

// Power Capacity Constants
const MAX_POWER_CAPACITY = 120;
const BASE_POWER_REGEN_RATE_PER_SECOND = 12 / 1.3;

// Health Regeneration Constants
const BASE_HEALTH_REGEN_RATE_PER_SECOND = 1.35 / 0.3;
const HEALTH_DEBUFF_MULTIPLIER = 0.6;
const BASE_HEALTH_DEBUFF_DURATION = 9000;

// Special Move Costs
const FIREBALL_COST = 20;
const LASER_COST = 30;
const LIGHTNING_COST = 40;
const KAMEHAMEHA_MIN_COST = 35;
const KAMEHAMEHA_MAX_COST = 50;

// Special Move Damage
const fireballInitialDamage = 18;
const fireballDotDamage = 2;
const fireballDotDuration = 3000;
const fireballDotTicks = 3;
const LASER_DAMAGE = 23;
const LIGHTNING_DAMAGE = 28;
const KAMEHAMEHA_DMG_LVL1 = 15;
const KAMEHAMEHA_DMG_LVL2 = 23;
const KAMEHAMEHA_DMG_LVL3 = 32;

// Other Special Move Constants
const SELF_DAMAGE_PERCENT = 0.10;
const FIREBALL_SPEED = 7;
const BASE_LASER_SPEED_X = 16.5 * 1.15;
const LASER_HEIGHT = 10;
const LASER_SEGMENT_LENGTH = 55;
const LIGHTNING_WIDTH = 30;
const BASE_LIGHTNING_STRETCH_SPEED = 15.25 * 1.50;
const KAMEHAMEHA_STRETCH_SPEED_LVL2 = 22;
const KAMEHAMEHA_STRETCH_SPEED_LVL3 = 18;

// Ultimate Move Constants
const MAX_ULTIMATE_CHARGE = 100;
const ULTIMATE_CHARGE_RATE = (100 / 60000) * 0.75;
const ULTIMATE_CHARGE_PER_HIT = 1.2;
const ULTIMATE_EFFECT_DURATION = 2000;
const ULTIMATE_DAMAGE = 78.75;

// AI Constants
const AI_THINK_INTERVAL = 200;
const AI_ATTACK_RANGE_CLOSE = 70;
const AI_ATTACK_RANGE_FAR = 400;
const AI_JUMP_CHANCE = 0.1;
const AI_BLOCK_CHANCE = 0.3;
const AI_TELEPORT_CHANCE = 0.1;
const AI_LOW_HEALTH_THRESHOLD = 0.45;

// Game state variables
const projectiles = [];
const effects = [];
const particles = [];
const flyTexts = [];
const iceWalls = []; 
let activeClash = null;
let isPaused = true;
let isMusicOn = true;
let isSfxOn = true;
let gameSpeedMultiplier; 
let gameMode = '2P'; 
let gameOverTimeoutId = null;
let isGameFrozenForEnd = false; // NEW: Flag for the game over freeze


// Declare scaled variables
let GRAVITY;
let JUMP_VELOCITY;
let MOVE_SPEED;
let DASH_SPEED;
let DASH_DURATION;
let DASH_COOLDOWN;
let TELEPORT_CHARGE_TIME;
let POWER_REGEN_RATE_PER_SECOND;
let HEALTH_REGEN_RATE_PER_SECOND;
let HEALTH_DEBUFF_DURATION;
let LASER_SPEED_X;
let LIGHTNING_STRETCH_SPEED;

// Tone.js Synths and Effects
let arpeggiator, padSynth, bassSynth, kickDrum;
let musicLoop;
let masterMusicVolume;

function setupPauseMusic() {
    arpeggiator = new Tone.PolySynth(Tone.Synth, { oscillator: { type: "sawtooth" }, envelope: { attack: 0.01, decay: 0.2, sustain: 0.1, release: 0.5 }, volume: -12 });
    padSynth = new Tone.PolySynth(Tone.Synth, { oscillator: { type: "sine" }, envelope: { attack: 1, decay: 0.5, sustain: 0.4, release: 2 }, volume: -18 });
    bassSynth = new Tone.Synth({ oscillator: { type: "triangle" }, envelope: { attack: 0.05, decay: 0.1, sustain: 0.3, release: 0.8 }, volume: -10 });
    kickDrum = new Tone.MembraneSynth({ pitchDecay: 0.05, octaves: 10, envelope: { attack: 0.001, decay: 0.4, sustain: 0.01, release: 1.4, attackCurve: "exponential" }, volume: -6 });
    
    masterMusicVolume = new Tone.Volume(-Infinity).toDestination();
    arpeggiator.connect(masterMusicVolume);
    padSynth.connect(masterMusicVolume);
    bassSynth.connect(masterMusicVolume);
    kickDrum.connect(masterMusicVolume);

    const arpeggioNotes = ["C3", "E3", "G3", "A3"];
    const padNotes = ["C3", "E3", "G3"];
    const bassNotes = ["C2", "C2", "C2", "C2"];

    musicLoop = new Tone.Loop(time => {
        arpeggiator.triggerAttackRelease(arpeggioNotes[Math.floor(Math.random() * arpeggioNotes.length)], "8n", time);
        if (Tone.Transport.loop.iterations % 2 === 0) padSynth.triggerAttackRelease(padNotes, "1n", time);
        bassSynth.triggerAttackRelease(bassNotes[Tone.Transport.loop.iterations % bassNotes.length], "4n", time);
        kickDrum.triggerAttackRelease("C1", "8n", time);
    }, "8n");

    Tone.Transport.bpm.value = 120;
    Tone.Transport.loop = true;
    Tone.Transport.loopEnd = "1m";
    musicLoop.start(0);
}


function updateGameSpeedConstants() {
    // FIXED: Always calculate from BASE constants to prevent compounding speed
    gameSpeedMultiplier = parseFloat(gameSpeedSlider.value);
    GRAVITY = BASE_GRAVITY * gameSpeedMultiplier;
    JUMP_VELOCITY = BASE_JUMP_VELOCITY * gameSpeedMultiplier;
    MOVE_SPEED = BASE_MOVE_SPEED * gameSpeedMultiplier;
    DASH_SPEED = BASE_DASH_SPEED * gameSpeedMultiplier;
    DASH_DURATION = BASE_DASH_DURATION / gameSpeedMultiplier;
    DASH_COOLDOWN = BASE_DASH_COOLDOWN / gameSpeedMultiplier;
    TELEPORT_CHARGE_TIME = BASE_TELEPORT_CHARGE_TIME / gameSpeedMultiplier;
    HEALTH_DEBUFF_DURATION = BASE_HEALTH_DEBUFF_DURATION / gameSpeedMultiplier;
    POWER_REGEN_RATE_PER_SECOND = BASE_POWER_REGEN_RATE_PER_SECOND * gameSpeedMultiplier;
    HEALTH_REGEN_RATE_PER_SECOND = BASE_HEALTH_REGEN_RATE_PER_SECOND * gameSpeedMultiplier;
    LASER_SPEED_X = BASE_LASER_SPEED_X * gameSpeedMultiplier;
    LIGHTNING_STRETCH_SPEED = BASE_LIGHTNING_STRETCH_SPEED * gameSpeedMultiplier;
}

gameSpeedSlider.addEventListener('input', (event) => {
    const newSpeed = parseFloat(event.target.value);
    gameSpeedValueDisplay.textContent = `${newSpeed.toFixed(1)}x`;
    pauseGameSpeedSlider.value = newSpeed;
    pauseGameSpeedValueDisplay.textContent = `${newSpeed.toFixed(1)}x`;
    updateGameSpeedConstants(); // Update constants whenever slider changes
});

pauseGameSpeedSlider.addEventListener('input', (event) => {
    const newSpeed = parseFloat(event.target.value);
    pauseGameSpeedValueDisplay.textContent = `${newSpeed.toFixed(1)}x`;
    gameSpeedSlider.value = newSpeed;
    gameSpeedValueDisplay.textContent = `${newSpeed.toFixed(1)}x`;
    updateGameSpeedConstants(); // Update constants whenever slider changes
});


class Fighter {
    constructor({ x, y, width, height, color, controls, direction = 'right', isAI = false }) {
        this.x = x;
        this.y = y;
        this.originalWidth = width;
        this.originalHeight = height;
        this.width = width;
        this.height = height;
        this.color = color;
        this.originalColor = color;
        this.velocity = { x: 0, y: 0 };
        this.health = MAX_HEALTH;
        this.isAttacking = false;
        this.attackCooldown = 0;
        this.direction = direction;
        this.controls = controls;
        this.onGround = false;
        this.wasOnGround = true; // For landing sound
        this.isJumping = false;
        this.isHitByBasicAttack = false;
        this.isDucking = false;
        this.wasDucking = false; // For ducking sound
        this.currentAttackType = null;
        this.powerCapacity = 0;
        this.ultimateCharge = 0;
        this.healingDebuffTimer = 0;
        this.isHealingDebuffed = false;
        this.kamehamehaChargeStartTime = 0;
        this.isChargingKamehameha = false;
        this.isFrozen = false;
        this.isBlocking = false;
        this.kamehamehaClashPresses = 0;
        this.chargingBall = { active: false, size: 0, fillColor: 'white', outlineColor: null };
        this.isFlashingBlack = false;
        this.isShieldFlashing = false;
        this.laserCooldown = 0;
        this.lightningCooldown = 0;
        this.fireballCooldown = 0;
        this.kamehamehaCooldown = 0;
        this.blockReleaseIntent = false; 
        this.regenDelay = 0; 
        this.isBeingPushed = false;
        this.pushbackInfo = null;
        this.isElectrified = false; 
        this.electrifyColor = null; 
        this.isFlashingWhite = false;
        this.greenBarDepleted = false;
        this.isDashing = false; 
        this.dashCooldownTimer = 0;
        this.lastLeftPressTime = 0; 
        this.lastRightPressTime = 0; 
        this.teleportCharges = 3;
        this.teleportChargeTime = 0;
        this.isTeleporting = false;
        this.isContinuouslyTeleporting = false;
        this.awakening = { active: false, mode: 0, timer: 0, outlineColor: null };
        this.stage2TeleportUsed = false;
        this.isHit = false;
        this.burnEffect = null;
        this.isEncasedInIce = false; 
        this.iceEncasementColor = null; 
        this.isAI = isAI;
        this.aiLastDecisionTime = 0;
        this.loopingSfx = null; // For looping sounds
        this.hasPlayedYellowHealthSfx = false;
        this.hasPlayedRedHealthSfx = false;
    }
    
    freeze(duration, effectType = 'stun', sourceProjectile = null) {
        this.isFrozen = true;
        if (this.isChargingKamehameha) {
            this.releaseKamehameha();
        }
        if (effectType === 'stun') {
            flyTexts.push(new FlyText({
                x: this.x + this.width / 2,
                y: this.y + this.height / 2,
                text: 'Stun',
                color: 'grey',
                fontSize: 30
            }));
        } else if (effectType === 'ice' && sourceProjectile) {
            this.isEncasedInIce = true;
            this.iceEncasementColor = sourceProjectile.owner === player1 ? 'rgba(173, 216, 230, 0.5)' : 'rgba(255, 255, 255, 0.5)';
            flyTexts.push(new FlyText({
                x: this.x + this.width / 2,
                y: this.y - 20,
                text: 'Frozen',
                color: '#ADD8E6',
                fontSize: 30
            }));
        }
        setTimeout(() => {
            this.isFrozen = false;
            if (effectType === 'ice') {
                this.isEncasedInIce = false;
                this.iceEncasementColor = null;
            }
        }, duration);
    }

    flash(color) {
        if (color === 'black') {
            this.isFlashingBlack = true;
            setTimeout(() => { this.isFlashingBlack = false; }, 150 / gameSpeedMultiplier);
        } else {
            this.color = color;
            setTimeout(() => {
                this.color = this.originalColor;
            }, 100 / gameSpeedMultiplier);
        }
    }
    
    flashShield() {
        this.isShieldFlashing = true;
        setTimeout(() => {
            this.isShieldFlashing = false;
        }, 100 / gameSpeedMultiplier);
    }

    draw() {
        if (this.isTeleporting || this.isContinuouslyTeleporting) return;

        // FIXED: Motion blur effect
        if (this.isBeingPushed && this.pushbackInfo) {
            ctx.save();
            const pushProgress = this.pushbackInfo.elapsedTime / this.pushbackInfo.totalDuration;
            const direction = Math.sign(this.pushbackInfo.totalDistance);
            ctx.globalAlpha = 0.4;
            ctx.fillStyle = this.color;
            ctx.fillRect(this.x - (20 * pushProgress * direction), this.y, this.width, this.height);
            ctx.globalAlpha = 0.2;
            ctx.fillRect(this.x - (40 * pushProgress * direction), this.y, this.width, this.height);
            ctx.restore();
        }

        ctx.fillStyle = this.isFlashingWhite ? 'white' : this.color;
        ctx.fillRect(this.x, this.y, this.width, this.height);

        if (this.isEncasedInIce) {
            ctx.fillStyle = this.iceEncasementColor;
            ctx.fillRect(this.x - 5, this.y - 5, this.width + 10, this.height + 10);
        }

        if (this.awakening.active && this.awakening.mode === 2) {
            ctx.strokeStyle = this.awakening.outlineColor;
            ctx.lineWidth = 5;
            ctx.strokeRect(this.x - 2, this.y - 2, this.width + 4, this.height + 4);
        }

        if (this.isElectrified) {
            ctx.strokeStyle = this.electrifyColor;
            ctx.lineWidth = 3;
            ctx.strokeRect(this.x, this.y, this.width, this.height);
        }

        if (this.isFlashingBlack) {
            ctx.fillStyle = 'rgba(0,0,0,0.9)';
            ctx.fillRect(this.x, this.y, this.width, this.height);
        }

        let eyeColor = this === player1 ? 'white' : 'black';
        
        if (this.awakening.active && this.awakening.mode === 2) eyeColor = this.awakening.outlineColor; 
        if (this.awakening.active && this.awakening.mode === 1) eyeColor = this === player1 ? '#00FFFF' : '#FF4500';
        
        ctx.fillStyle = eyeColor;
        
        const eyeWidth = this.awakening.active && this.awakening.mode === 2 ? 7 : 5;
        const eyeHeight = this.awakening.active && this.awakening.mode === 2 ? 7 : 5;
        const eyeY = this.y + 15;

        let eye1X, eye2X;

        if (this.direction === 'right') {
            eye1X = this.x + this.width - 20;
            eye2X = this.x + this.width - 10;
        } else {
            eye1X = this.x + 5;
            eye2X = this.x + 15;
        }
        
        if (this.isHit) {
            ctx.fillRect(eye1X, eyeY + 2, eyeWidth, 1);
            ctx.fillRect(eye2X, eyeY + 2, eyeWidth, 1);
        } else if (this.isAttacking) {
            ctx.fillRect(eye1X, eyeY + 2, eyeWidth, 2);
            ctx.fillRect(eye2X, eyeY + 2, eyeWidth, 2);
        } else if (this.isBlocking) {
            if (this.direction === 'right') {
                ctx.fillRect(eye1X + 2, eyeY, 2, eyeHeight);
                ctx.fillRect(eye2X + 2, eyeY, 2, eyeHeight);
            } else {
                ctx.fillRect(eye1X - 2, eyeY, 2, eyeHeight);
                ctx.fillRect(eye2X - 2, eyeY, 2, eyeHeight);
            }
        } else {
            ctx.fillRect(eye1X, eyeY, eyeWidth, eyeHeight);
            ctx.fillRect(eye2X, eyeY, eyeWidth, eyeHeight);
        }
        
        if (this.awakening.active && this.awakening.mode === 1) {
            ctx.strokeStyle = this === player1 ? 'white' : 'black';
            ctx.lineWidth = 2;
            ctx.strokeRect(eye1X - 2, eyeY - 2, eyeWidth + 4, eyeHeight + 4);
            ctx.strokeRect(eye2X - 2, eyeY - 2, eyeWidth + 4, eyeHeight + 4);
        }

        if (this.awakening.active && this.awakening.mode === 1) {
            const mouthY = this.y + 40; 
            const mouthWidth = 20; 
            let mouthX;

            if (this.direction === 'right') {
                mouthX = this.x + this.width - mouthWidth - 5; 
            } else {
                mouthX = this.x + 5; 
            }

            const mouthColor = this === player1 ? 'white' : 'black';
            ctx.fillStyle = mouthColor;
            
            ctx.fillRect(mouthX, mouthY, mouthWidth, 2);
            
            for (let i = 0; i < 4; i++) {
                const toothX = mouthX + 2 + i * ((mouthWidth - 4) / 3);
                ctx.fillRect(toothX, mouthY - 2, 2, 6); 
            }
        }

        if (this.isBlocking) {
            const shieldWidth = 20;
            const shieldHeight = this.height;
            const shieldX = this.direction === 'right' ? this.x + this.width : this.x - shieldWidth;
            if (this.isShieldFlashing) {
                ctx.strokeStyle = 'white';
                ctx.lineWidth = 2;
                ctx.strokeRect(shieldX, this.y, shieldWidth, shieldHeight);
            } else {
                ctx.fillStyle = this === player1 ? 'rgba(0, 0, 0, 0.5)' : 'white';
                ctx.fillRect(shieldX, this.y, shieldWidth, shieldHeight);
            }
        }

        if (this.isAttacking && (this.currentAttackType === 'mid' || this.currentAttackType === 'low')) {
            ctx.save();
            ctx.translate(this.x, this.y);
            ctx.fillStyle = 'lightgray';
            
            const attackRange = this.awakening.active && this.awakening.mode === 1 ? 6.75 : 1.75;
            const swordY = this.currentAttackType === 'mid' ? this.height / 2 - 5 : this.height * 0.7;

            if (this.direction === 'right') {
                ctx.fillRect(this.width, swordY, 30 * attackRange, 10); 
                ctx.fillRect(this.width + (25 * attackRange), swordY - 2, 5 * attackRange, 14); 
            } else {
                ctx.fillRect(-30 * attackRange, swordY, 30 * attackRange, 10); 
                ctx.fillRect(-30 * attackRange, swordY - 2, 5 * attackRange, 14); 
            }
            ctx.restore();
        }

        if (this.isChargingKamehameha) {
            const ballX = this.direction === 'right' ? this.x + this.width + this.chargingBall.size : this.x - this.chargingBall.size;
            const ballY = this.y + this.height / 2;
            
            ctx.beginPath();
            ctx.arc(ballX, ballY, this.chargingBall.size, 0, Math.PI * 2);
            
            ctx.fillStyle = this.chargingBall.fillColor;
            ctx.fill();

            if (this.chargingBall.outlineColor) {
                ctx.strokeStyle = this.chargingBall.outlineColor;
                ctx.lineWidth = 3;
                ctx.stroke();
            }
        }
    }

    update() {
        this.draw();
        if (this.isFrozen) {
            if (this.isEncasedInIce && Math.random() < 0.5) {
                const iceBlockX = this.x - 5;
                const iceBlockY = this.y - 5;
                const iceBlockWidth = this.width + 10;
                const iceBlockHeight = this.height + 10;
                
                const side = Math.floor(Math.random() * 4);
                let spawnX, spawnY;
                if (side === 0) {
                    spawnX = iceBlockX + Math.random() * iceBlockWidth;
                    spawnY = iceBlockY;
                } else if (side === 1) {
                    spawnX = iceBlockX + Math.random() * iceBlockWidth;
                    spawnY = iceBlockY + iceBlockHeight;
                } else if (side === 2) {
                    spawnX = iceBlockX;
                    spawnY = iceBlockY + Math.random() * iceBlockHeight;
                } else {
                    spawnX = iceBlockX + iceBlockWidth;
                    spawnY = iceBlockY + Math.random() * iceBlockHeight;
                }

                particles.push(new Particle({
                    x: spawnX,
                    y: spawnY,
                    radius: Math.random() * 1.5 + 1,
                    color: 'rgba(255, 255, 255, 0.8)',
                    velocity: { x: (Math.random() - 0.5) * 0.5, y: (Math.random() - 0.5) * 0.5 },
                    friction: 0.98
                }));
            }
            return;
        }

        if (this.isContinuouslyTeleporting) {
            createTeleportEffect(this.x + this.width / 2, this.y + this.height / 2);
        }

        if (this.burnEffect && this.burnEffect.ticks > 0) {
            const now = Date.now();
            if (now >= this.burnEffect.nextTickTime) {
                this.takeDamage(fireballDotDamage, null, true); // Pass true to prevent hit sound on tick
                this.burnEffect.ticks--;
                this.burnEffect.nextTickTime = now + (fireballDotDuration / fireballDotTicks);
            }
            for (let i = 0; i < 2; i++) {
                const particleColor = Math.random() < 0.5 ? this.burnEffect.mainColor : this.burnEffect.outlineColor;
                particles.push(new Particle({
                    x: this.x + Math.random() * this.width,
                    y: this.burnEffect.y,
                    radius: Math.random() * 2 + 1,
                    color: particleColor,
                    velocity: { x: (Math.random() - 0.5) * 1, y: (Math.random() - 0.5) * 1 - 1 },
                    friction: 0.95
                }));
            }
            if (this.burnEffect.ticks <= 0) {
                this.burnEffect = null;
            }
        }


        if (this.awakening.active) {
            this.awakening.timer -= (16 * gameSpeedMultiplier);
            if (this.awakening.timer <= 0) {
                playSound('awakeningEndSfx');
                if (this.awakening.mode === 2) {
                    this.isHealingDebuffed = true;
                    this.healingDebuffTimer = HEALTH_DEBUFF_DURATION;
                }
                this.awakening.active = false;
                this.awakening.mode = 0;
                this.awakening.outlineColor = null;
                this.isContinuouslyTeleporting = false;
                if (this.loopingSfx) {
                    this.loopingSfx.pause();
                    this.loopingSfx = null;
                }
            }
        }

        if (this.isChargingKamehameha) {
            const chargeDuration = Date.now() - this.kamehamehaChargeStartTime;
            if (chargeDuration >= (this.awakening.active && this.awakening.mode === 2 ? (2000 / gameSpeedMultiplier) : (3500 / gameSpeedMultiplier))) {
                this.chargingBall.size = 25;
                if (this === player1) {
                    this.chargingBall.fillColor = '#483D8B'; 
                    this.chargingBall.outlineColor = 'black';
                } else { 
                    this.chargingBall.fillColor = 'red';
                    this.chargingBall.outlineColor = 'white';
                }
            } else if (chargeDuration >= (1500 / gameSpeedMultiplier)) {
                this.chargingBall.size = 20;
                this.chargingBall.fillColor = this === player1 ? 'lightblue' : '#FFD700';
                this.chargingBall.outlineColor = null;
            } else {
                this.chargingBall.size = 15;
                this.chargingBall.fillColor = this === player1 ? 'lightblue' : '#FFD700';
                this.chargingBall.outlineColor = null;
            }
        } else {
            this.chargingBall.active = false;
        }

        const targetHeight = this.isDucking ? this.originalHeight * DUCK_HEIGHT_MULTIPLIER : this.originalHeight;
        if (this.height !== targetHeight) {
            const heightDifference = this.height - targetHeight;
            this.y += heightDifference;
            this.height = targetHeight;
        }
        
        this.velocity.y += GRAVITY;

        if (this.isBeingPushed && this.pushbackInfo) {
            const info = this.pushbackInfo;
            info.elapsedTime += (16 * gameSpeedMultiplier); 
            const progress = Math.min(info.elapsedTime / info.totalDuration, 1);
            
            this.x = info.startX + info.totalDistance * (1 - Math.pow(1 - progress, 3)); 

            if (progress >= 1) {
                this.isBeingPushed = false;
                this.pushbackInfo = null;
            }
        } else {
            this.x += this.velocity.x;
        }
        
        this.y += this.velocity.y;

        if (this.y + this.height > canvas.height - 0) {
            if (!this.wasOnGround) {
                playSound('landSfx');
            }
            this.y = canvas.height - this.height - 0;
            this.velocity.y = 0;
            this.onGround = true;
            this.isJumping = false;
        } else {
            this.onGround = false;
        }
        this.wasOnGround = this.onGround;

        if (this.x < 0) this.x = 0;
        if (this.x + this.width > canvas.width) this.x = canvas.width - this.width;

        if (this.regenDelay > 0) {
            this.regenDelay -= (16 * gameSpeedMultiplier);
        }

        if (this.dashCooldownTimer > 0) {
            this.dashCooldownTimer -= (16 * gameSpeedMultiplier);
        }
        
        const currentTeleportChargeTime = this.awakening.active && this.awakening.mode === 1 ? (6000 / gameSpeedMultiplier) : (BASE_TELEPORT_CHARGE_TIME / gameSpeedMultiplier);
        if (this.teleportCharges < 3) {
            this.teleportChargeTime += (16 * gameSpeedMultiplier);
            if (this.teleportChargeTime >= currentTeleportChargeTime) {
                this.teleportCharges++;
                this.teleportChargeTime = 0;
            }
        }

        if (this.regenDelay <= 0) {
            let currentHealthRegenRate = BASE_HEALTH_REGEN_RATE_PER_SECOND;
            if (this.isHealingDebuffed) {
                this.healingDebuffTimer -= (16 * gameSpeedMultiplier);
                if (this.healingDebuffTimer <= 0) this.isHealingDebuffed = false;
                else currentHealthRegenRate *= HEALTH_DEBUFF_MULTIPLIER;
            }
            
            let finalHealthRegenRate = currentHealthRegenRate;
            if (this.awakening.active && this.awakening.mode === 2) {
                finalHealthRegenRate *= 1.8; 
            }

            const maxRegenHealth = (this.greenBarDepleted && !(this.awakening.active && this.awakening.mode === 2)) ? YELLOW_HEALTH_SEGMENT : MAX_HEALTH;
            
            if (this.health < maxRegenHealth) { 
                const oldHealth = this.health;
                const newHealth = this.health + finalHealthRegenRate * (16 / 1000);
                this.health = Math.min(newHealth, maxRegenHealth);
                if(oldHealth < YELLOW_HEALTH_SEGMENT && this.health >= YELLOW_HEALTH_SEGMENT && this.awakening.active && this.awakening.mode === 2) {
                    playSound('greenHealthRegenSfx');
                }
            }
            
            if (this.greenBarDepleted && this.health > YELLOW_HEALTH_SEGMENT) {
                this.greenBarDepleted = false;
            }
            
            let powerRegenAmount = BASE_POWER_REGEN_RATE_PER_SECOND * (16 / 1000);
            if (this.awakening.active && this.awakening.mode === 2) {
                powerRegenAmount *= 2.5; 
            }
            this.powerCapacity = Math.min(MAX_POWER_CAPACITY, this.powerCapacity + powerRegenAmount);
        }
        
        if (!this.awakening.active) {
            this.ultimateCharge = Math.min(MAX_ULTIMATE_CHARGE, this.ultimateCharge + ULTIMATE_CHARGE_RATE * (16 * gameSpeedMultiplier));
        }

        if (this.attackCooldown > 0) this.attackCooldown -= (16 * gameSpeedMultiplier);
        if (this.laserCooldown > 0) this.laserCooldown -= (16 * gameSpeedMultiplier);
        if (this.lightningCooldown > 0) this.lightningCooldown -= (16 * gameSpeedMultiplier);
        if (this.fireballCooldown > 0) this.fireballCooldown -= (16 * gameSpeedMultiplier);
        if (this.kamehamehaCooldown > 0) this.kamehamehaCooldown -= (16 * gameSpeedMultiplier);
        this.updateUI();

        if (this.isEncasedInIce) return;

        let particleCount = (this.isMoving || this.isAttacking) ? 3 : 1;
        if(this.awakening.active && this.awakening.mode === 1) particleCount *= 1.8;
        
        for (let i = 0; i < particleCount; i++) {
            let fireColor = this === player1 ? '#4169E1' : '#FFA500'; 
            let elecColor = this === player1 ? '#ADD8E6' : '#FF0000'; 
            let particleRadius = Math.random() * 2 + 1;

            if(this.awakening.active && this.awakening.mode === 2) {
                fireColor = this.awakening.outlineColor;
                elecColor = this.awakening.outlineColor;
                particleRadius *= 1.5;
            }
            
            const spawnX = this.x + Math.random() * this.width;
            const spawnY = this.y + Math.random() * this.height;

            const particleVelX = (Math.random() - 0.5) * 2 - this.velocity.x * 0.2;
            const particleVelY = (Math.random() - 0.5) * 2 - this.velocity.y * 0.2;

            particles.push(new Particle({
                x: spawnX,
                y: spawnY,
                radius: particleRadius,
                color: Math.random() > 0.5 ? fireColor : elecColor,
                velocity: {
                    x: particleVelX,
                    y: particleVelY
                }
            }));
        }
    }

    updateUI() {
        const healthBarFill = document.querySelector(`#${this === player1 ? 'player1Health' : 'player2Health'} .health-fill`);
        const healthBarLayer2 = document.querySelector(`#${this === player1 ? 'player1Health' : 'player2Health'} .health-fill-layer2`);
        const powerBarFill = document.querySelector(`#${this === player1 ? 'player1Resource' : 'player2Resource'} .power-fill`);
        
        const teleportChargesUI = this === player1 ? player1TeleportChargesUI : player2TeleportChargesUI;
        const singleTeleportUI = this === player1 ? player1SingleTeleportUI : player2SingleTeleportUI;
        const awakeningIndicator = this === player1 ? player1AwakeningIndicator : player2AwakeningIndicator;
        const awakeningPlus = this === player1 ? player1AwakeningPlus : player2AwakeningPlus;

        if (this.health > YELLOW_HEALTH_SEGMENT) {
            const greenHealth = this.health - YELLOW_HEALTH_SEGMENT;
            healthBarFill.style.width = `${(greenHealth / GREEN_HEALTH_SEGMENT) * 100}%`;
            healthBarLayer2.style.width = '100%';
        } else {
            healthBarFill.style.width = '0%';
            healthBarLayer2.style.width = `${(this.health / YELLOW_HEALTH_SEGMENT) * 100}%`;
        }

        const redThreshold = MAX_HEALTH * 0.2; // FIXED: Changed to 20%
        if (this.health <= redThreshold) {
            healthBarLayer2.style.backgroundColor = '#ef4444'; 
        } else {
            healthBarLayer2.style.backgroundColor = '#f6e05e'; 
        }

        powerBarFill.style.width = `${(this.powerCapacity / MAX_POWER_CAPACITY) * 100}%`;
        
        if (this.awakening.active && this.awakening.mode === 1) {
            teleportChargesUI.style.display = 'none';
            singleTeleportUI.style.display = 'block';
            awakeningIndicator.style.display = 'block';
            awakeningPlus.style.display = 'none';
            singleTeleportUI.classList.remove('used');
        } else if (this.awakening.active && this.awakening.mode === 2) {
            teleportChargesUI.style.display = 'none';
            singleTeleportUI.style.display = 'block'; 
            awakeningIndicator.style.display = 'none';
            awakeningPlus.style.display = 'block';
            singleTeleportUI.classList.toggle('used', this.stage2TeleportUsed);
        } else {
            teleportChargesUI.style.display = 'flex';
            singleTeleportUI.style.display = 'none';
            awakeningIndicator.style.display = 'none';
            awakeningPlus.style.display = 'none';
            teleportChargesUI.querySelectorAll('.teleport-charge-bar').forEach((bar, index) => {
                bar.classList.toggle('full', index < this.teleportCharges);
            });
        }


        this === player1 ? this.drawUltimateCharge(player1UltimateCtx, player1UltimateCanvas, true) : this.drawUltimateCharge(player2UltimateCtx, player2UltimateCanvas, false);
    }

    drawUltimateCharge(ctx, canvasElem, isPlayer1) {
        const centerX = canvasElem.width / 2;
        const centerY = canvasElem.height / 2;
        const radius = (canvasElem.width / 2) - 2;
        ctx.clearRect(0, 0, canvasElem.width, canvasElem.height);
        
        ctx.beginPath();
        ctx.moveTo(centerX, centerY);
        ctx.arc(centerX, centerY, radius, -Math.PI / 2, (2 * Math.PI * (this.ultimateCharge / MAX_ULTIMATE_CHARGE)) - Math.PI / 2);
        ctx.closePath();
        ctx.fillStyle = 'white';
        ctx.fill();

        ctx.fillStyle = 'black';
        ctx.font = 'bold 10px Inter';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(`${Math.floor(this.ultimateCharge)}%`, centerX, centerY);
    }

    jump() {
        if (this.onGround && !this.isDashing) {
            this.velocity.y = JUMP_VELOCITY;
            this.onGround = false;
            this.isJumping = true;
            playSound('jumpSfx');
        }
    }
    
    dash(direction) {
        if (this.isDashing || !this.onGround || this.isFrozen || this.isBlocking || this.isBeingPushed || this.dashCooldownTimer > 0) return;
        playSound('dashSfx');
        this.isDashing = true;
        this.dashCooldownTimer = DASH_COOLDOWN;
        this.velocity.x = direction === 'right' ? DASH_SPEED : -DASH_SPEED;

        for (let i = 0; i < 5; i++) {
            setTimeout(() => {
                particles.push(new Particle({
                    x: this.x + this.width / 2,
                    y: this.y + this.height - 10,
                    radius: Math.random() * 3 + 2,
                    color: 'rgba(255, 255, 255, 0.5)',
                    velocity: { x: (Math.random() - 0.5) * 2, y: Math.random() * -2 }
                }));
            }, i * (30 / gameSpeedMultiplier)); 
        }

        setTimeout(() => {
            this.isDashing = false;
        }, DASH_DURATION);
    }

    teleport() {
        if (this.isTeleporting) return;
        
        if (this.awakening.active && this.awakening.mode === 2) {
            if (this.stage2TeleportUsed) return;
            this.stage2TeleportUsed = true;
        } 
        else if (this.awakening.active && this.awakening.mode === 1) {
            // No charge consumption
        } 
        else {
            if (this.teleportCharges <= 0) return;
            this.teleportCharges--;
            this.teleportChargeTime = 0;
        }
        
        playSound('teleportSfx');

        const opponent = this === player1 ? player2 : player1;

        const upPressed = this.isAI ? false : keys[this.controls.up];
        const leftPressed = this.isAI ? false : keys[this.controls.left];
        const rightPressed = this.isAI ? false : keys[this.controls.right];
        const downPressed = this.isAI ? false : keys[this.controls.duck];

        const isToLeftOfOpponent = this.x < opponent.x;
        const isMovingTowards = (isToLeftOfOpponent && rightPressed) || (!isToLeftOfOpponent && leftPressed);
        const isMovingAway = (isToLeftOfOpponent && leftPressed) || (!isToLeftOfOpponent && rightPressed);
        
        if (downPressed) {
            if (!(this.awakening.active && (this.awakening.mode === 1 || this.awakening.mode === 2))) {
                 this.teleportCharges++;
            }
            if (this.awakening.active && this.awakening.mode === 2) {
                this.stage2TeleportUsed = false; 
            }
            return;
        }
        
        createTeleportEffect(this.x + this.width / 2, this.y + this.height / 2);

        if (upPressed) {
            this.y = 10;
            createTeleportEffect(this.x + this.width / 2, this.y + this.height / 2);
        } else if (isMovingTowards) {
            this.x = opponent.x + (isToLeftOfOpponent ? opponent.width + (this.width * 0.5) : -this.width - (this.width * 0.5));
            createTeleportEffect(this.x + this.width / 2, this.y + this.height / 2);
        } else if (isMovingAway) {
            this.x = isToLeftOfOpponent ? 0 : canvas.width - this.width;
            createTeleportEffect(this.x + this.width / 2, this.y + this.height / 2);
        } else { 
            this.isTeleporting = true;
            const reappearX = this.x;
            const reappearY = this.y;
            setTimeout(() => {
                this.isTeleporting = false;
                createTeleportEffect(reappearX + this.width / 2, reappearY + this.height / 2);
            }, 500 / gameSpeedMultiplier);
        }
    }

    midAttack() {
        if (!this.isAttacking && this.attackCooldown <= 0 && !this.isDashing) {
            this.isAttacking = true;
            this.currentAttackType = 'mid';
            if (this.awakening.active && this.awakening.mode === 1) {
                playSound('midAttackAwakenedSfx');
            } else {
                playSound('midAttackSfx');
            }
            
            const speedFactor = (this.awakening.active && this.awakening.mode === 1) ? 1.5 : 1;
            const attackAnimDuration = BASIC_ATTACK_DURATION * speedFactor;
            const attackRecovery = 200 * speedFactor;

            this.attackCooldown = (attackAnimDuration + attackRecovery);
            setTimeout(() => { this.isAttacking = false; this.currentAttackType = null; }, attackAnimDuration / gameSpeedMultiplier);
        }
    }

    lowAttack() {
        if (!this.isAttacking && this.attackCooldown <= 0 && !this.isDashing) {
            this.isAttacking = true;
            this.currentAttackType = 'low';
            if (this.awakening.active && this.awakening.mode === 1) {
                playSound('lowAttackAwakenedSfx');
            } else {
                playSound('lowAttackSfx');
            }

            const speedFactor = (this.awakening.active && this.awakening.mode === 1) ? 1.5 : 1;
            const attackAnimDuration = BASIC_ATTACK_DURATION * speedFactor;
            const attackRecovery = 200 * speedFactor;

            this.attackCooldown = (attackAnimDuration + attackRecovery);
            setTimeout(() => { this.isAttacking = false; this.currentAttackType = null; }, attackAnimDuration / gameSpeedMultiplier);
        }
    }
    
    startPushback(distance, duration) {
        this.isBeingPushed = true;
        this.pushbackInfo = {
            totalDistance: distance,
            totalDuration: duration / gameSpeedMultiplier,
            elapsedTime: 0,
            startX: this.x
        };
    }

    fireballAttack() {
        if (this.powerCapacity < FIREBALL_COST || this.isDashing || (this.awakening.active && this.awakening.mode === 1) || this.fireballCooldown > 0) {
            return;
        }
        
        this.powerCapacity -= FIREBALL_COST;
        this.fireballCooldown = 750 / gameSpeedMultiplier;
        

        if (this.awakening.active && this.awakening.mode === 2) {
            playSound('iceballSfx');
            const iceballRadius = 25;
            const iceballX = this.direction === 'right' ? this.x + this.width + 5 : this.x - (iceballRadius * 2) + 5;
            const iceballY = this.y + this.height / 2;
            const color = this === player1 ? '#ADD8E6' : 'white';
            
            projectiles.push(new Projectile({
                x: iceballX, y: iceballY, radius: iceballRadius, color: color,
                velocity: { x: this.direction === 'right' ? FIREBALL_SPEED : -FIREBALL_SPEED, y: 0 },
                owner: this, damage: fireballInitialDamage * 0.35, type: 'iceball', freezeDuration: 4500
            }));
        } else {
            playSound('fireballSfx');
            const fireballX = this.direction === 'right' ? this.x + this.width + 5 : this.x - 25;
            const fireballY = this.y + this.height / 2 - 10;
            const color = this === player1 ? '#000080' : 'orange';
            projectiles.push(new Projectile({ x: fireballX, y: fireballY, radius: 15, color: color, velocity: { x: this.direction === 'right' ? FIREBALL_SPEED : -FIREBALL_SPEED, y: 0 }, owner: this, damage: fireballInitialDamage, type: 'fireball' }));
        }
    }

    lightningAttack() {
        if (this.powerCapacity >= LIGHTNING_COST && this.lightningCooldown <= 0 && !this.isDashing && !(this.awakening.active && this.awakening.mode === 1)) {
            this.lightningCooldown = 4500 / gameSpeedMultiplier;
            this.powerCapacity -= LIGHTNING_COST;
            
            let color, outlineColor = null;
            if (this.awakening.active && this.awakening.mode === 2) {
                playSound('lightningAwakenedSfx');
                if (this === player1) {
                    color = 'black';
                    outlineColor = 'white';
                } else {
                    color = '#FFD700'; 
                    outlineColor = '#800080'; 
                }
            } else {
                playSound('lightningSfx');
                color = this === player1 ? 'cyan' : '#6A0DAD';
            }
            
            const opponent = this === player1 ? player2 : player1;
            if (this.awakening.active && this.awakening.mode === 2) {
                const skinnyWidth = LIGHTNING_WIDTH * 0.45;
                const centerX = opponent.x + opponent.width / 2 - skinnyWidth / 2;
                const spread = opponent.width * 1.75;
                projectiles.push(new Projectile({ x: centerX - spread, y: 0, width: skinnyWidth, height: 0, color: color, outlineColor: outlineColor, velocity: { x: 0, y: 0 }, owner: this, damage: LIGHTNING_DAMAGE, type: 'lightning', duration: 1750 / gameSpeedMultiplier }));
                projectiles.push(new Projectile({ x: centerX, y: 0, width: skinnyWidth, height: 0, color: color, outlineColor: outlineColor, velocity: { x: 0, y: 0 }, owner: this, damage: LIGHTNING_DAMAGE, type: 'lightning', duration: 1750 / gameSpeedMultiplier }));
                projectiles.push(new Projectile({ x: centerX + spread, y: 0, width: skinnyWidth, height: 0, color: color, outlineColor: outlineColor, velocity: { x: 0, y: 0 }, owner: this, damage: LIGHTNING_DAMAGE, type: 'lightning', duration: 1750 / gameSpeedMultiplier }));
            } else {
                const startX = opponent.x + opponent.width / 2 - (LIGHTNING_WIDTH / 2);
                projectiles.push(new Projectile({ x: startX, y: 0, width: LIGHTNING_WIDTH, height: 0, color: color, velocity: { x: 0, y: 0 }, owner: this, damage: LIGHTNING_DAMAGE, type: 'lightning', duration: 1750 / gameSpeedMultiplier }));
            }
        }
    }

    laserAttack() {
        if (this.powerCapacity >= LASER_COST && this.laserCooldown <= 0 && !this.isDashing && !(this.awakening.active && this.awakening.mode === 1)) {
            this.laserCooldown = 1825 / gameSpeedMultiplier;
            this.powerCapacity -= LASER_COST;
            
            let color, height = LASER_HEIGHT;
            let length = LASER_SEGMENT_LENGTH;

            const speedMultiplier = this.awakening.active && this.awakening.mode === 2 ? 2.5 : 1;

            if (this.awakening.active && this.awakening.mode === 2) {
                height *= 1.75; 
                length *= 1.25
                color = this === player1 ? '#00BFFF' : '#FFD700'; 
                playSound('laserAwakenedSfx');
            } else {
                color = this === player1 ? '#00FF00' : '#FF0000';
                playSound('laserSfx');
            }

            const laserStartX = this.direction === 'right' ? this.x + this.width + 5 : this.x - length - 5;
            const laserStartY = this.y + this.height / 3;
            projectiles.push(new Projectile({ x: laserStartX, y: laserStartY, width: length, height: height, color: color, velocity: { x: this.direction === 'right' ? LASER_SPEED_X * speedMultiplier : -LASER_SPEED_X * speedMultiplier, y: 0 }, owner: this, damage: LASER_DAMAGE, type: 'laser' }));
        }
    }

    kamehamehaAttack() {
        if (this.powerCapacity >= KAMEHAMEHA_MIN_COST && !this.isChargingKamehameha && !this.isDashing && !(this.awakening.active && this.awakening.mode === 1) && this.kamehamehaCooldown <= 0) {
            this.isChargingKamehameha = true;
            this.kamehamehaChargeStartTime = Date.now();
            if (!this.loopingSfx) {
                this.loopingSfx = new Audio(kamehamehaChargeSfx.src);
                this.loopingSfx.loop = true;
                if (isSfxOn) this.loopingSfx.play();
            }
        }
    }

    releaseKamehameha() {
        if (!this.isChargingKamehameha) return;
        
        if (this.loopingSfx) {
            this.loopingSfx.pause();
            this.loopingSfx = null;
        }

        this.isChargingKamehameha = false;
        this.chargingBall.active = false;
        const chargeDuration = Date.now() - this.kamehamehaChargeStartTime;

        let beamLength, beamHeight, beamDamage, moveCost, color, stretchSpeed = 0;
        let fired = false;
        let initialBeamX;

        const isAwakenedLvl3 = this.awakening.active && this.awakening.mode === 2;

        if (isAwakenedLvl3) {
            if (chargeDuration >= (2000 / gameSpeedMultiplier)) {
                moveCost = KAMEHAMEHA_MAX_COST;
                beamDamage = KAMEHAMEHA_DMG_LVL3;
                beamHeight = 40;
                stretchSpeed = KAMEHAMEHA_STRETCH_SPEED_LVL3 * gameSpeedMultiplier * 2; 
                color = this === player1 ? 'black' : 'red';
                fired = true;
                playSound('kamehamehaLvl3Sfx');
            }
        } else {
            if (chargeDuration >= (3500 / gameSpeedMultiplier) && this.powerCapacity >= KAMEHAMEHA_MAX_COST) {
                moveCost = KAMEHAMEHA_MAX_COST;
                beamDamage = KAMEHAMEHA_DMG_LVL3;
                beamHeight = 40;
                stretchSpeed = KAMEHAMEHA_STRETCH_SPEED_LVL3 * gameSpeedMultiplier * 2; 
                color = this === player1 ? 'black' : 'red';
                fired = true;
                playSound('kamehamehaLvl3Sfx');
            } else if (chargeDuration >= (1500 / gameSpeedMultiplier) && this.powerCapacity >= KAMEHAMEHA_MIN_COST) {
                moveCost = KAMEHAMEHA_MIN_COST;
                beamDamage = KAMEHAMEHA_DMG_LVL2;
                beamLength = canvas.width * 0.5; 
                beamHeight = 20;
                stretchSpeed = KAMEHAMEHA_STRETCH_SPEED_LVL2 * gameSpeedMultiplier;
                color = this === player1 ? 'lightblue' : '#FFD700';
                fired = true;
                playSound('kamehamehaLvl2Sfx');
            } else if (this.powerCapacity >= KAMEHAMEHA_MIN_COST) {
                moveCost = KAMEHAMEHA_MIN_COST;
                beamDamage = KAMEHAMEHA_DMG_LVL1;
                beamLength = canvas.width * 0.25; 
                beamHeight = 20;
                stretchSpeed = 0;
                color = this === player1 ? 'lightblue' : '#FFD700';
                fired = true;
                playSound('kamehamehaLvl1Sfx');
            }
        }

        if (fired) {
            this.powerCapacity -= moveCost; 
            const beamY = this.y + this.height / 2 - beamHeight / 2;
            
            if (this.direction === 'right') {
                initialBeamX = this.x + this.width;
                if (beamDamage === KAMEHAMEHA_DMG_LVL3) {
                    beamLength = canvas.width - initialBeamX;
                }
            } else { 
                if (beamDamage === KAMEHAMEHA_DMG_LVL3) {
                    beamLength = this.x;
                    initialBeamX = 0;
                } else if (stretchSpeed > 0) { 
                    initialBeamX = this.x; 
                } else { 
                    initialBeamX = this.x - beamLength;
                }
            }

            projectiles.push(new Projectile({
                x: initialBeamX,
                y: beamY,
                width: beamLength,
                height: beamHeight,
                color: color,
                velocity: { x: 0, y: 0 },
                owner: this,
                damage: beamDamage,
                type: 'beam',
                stretchSpeed: stretchSpeed,
                isInstantFullLength: (beamDamage === KAMEHAMEHA_DMG_LVL1)
            }));
        }
    }

    ultimateAttack() {
        if (this.ultimateCharge >= MAX_ULTIMATE_CHARGE && !this.isDashing) {
            this.ultimateCharge = 0;
            playSound('ultimateSfx');
            const opponent = this === player1 ? player2 : player1;
            const effectX = opponent.x < canvas.width / 2 ? 0 : canvas.width / 2;
            
            const ultimateColor = this === player1 
                ? `rgba(0, 0, 0, 0.5)` 
                : `rgba(255, 255, 255, 0.5)`;

            effects.push(new Effect({ x: effectX, y: 0, width: canvas.width / 2, height: canvas.height, color: ultimateColor, duration: ULTIMATE_EFFECT_DURATION / gameSpeedMultiplier, type: 'ultimate', owner: this, damage: ULTIMATE_DAMAGE, target: opponent }));
            
            screenShake(200, 5);
        }
    }
    
    activateAwakening() {
        if (this.awakening.active) return;
        
        this.isFrozen = false; // Break out of stun

        if (this.ultimateCharge >= 100) {
            this.awakening.active = true;
            this.awakening.mode = 2;
            this.awakening.timer = 9000 / gameSpeedMultiplier;
            this.awakening.outlineColor = this === player1 ? 'black' : 'white';
            this.ultimateCharge = 0;
            this.stage2TeleportUsed = false; 
            createAwakeningBurst(this, 2);
            screenShake(300, 8);
            playSound('awakening2Sfx');
        } else if (this.ultimateCharge >= 50) {
            this.awakening.active = true;
            this.awakening.mode = 1;
            this.awakening.timer = 18000 / gameSpeedMultiplier;
            this.awakening.outlineColor = 'black'; 
            this.ultimateCharge = 0;
            createAwakeningBurst(this, 1);
            screenShake(150, 4);
            playSound('awakening1Sfx');
        }
    }

    takeDamage(amount, projectile = null, isUnblockable = false) {
        if (this.isDucking && !isUnblockable) {
            if (projectile && projectile.type === 'fireball') {
                amount *= 0.5;
            } else if (!projectile) { // Basic attacks
                if (this.currentAttackType === 'mid') return; // Mid attacks miss ducking players
                amount *= 0.5;
            }
        }

        const oldHealth = this.health;
        this.regenDelay = 1000 / gameSpeedMultiplier; 
        let damageToTake = amount;

        if (this.awakening.active) {
            damageToTake *= this.awakening.mode === 1 ? 0.2 : 0.5;
        }

        if (this.isBlocking && !isUnblockable) {
            const isBlockable = !(projectile && projectile.type === 'lightning');
            if (isBlockable) {
                if (projectile && projectile.type === 'fireball') playSound('shieldHitFireballSfx');
                else if (projectile && projectile.type === 'laser') playSound('shieldHitLaserSfx');
                else playSound('shieldHitPhysicalSfx');

                if (projectile && projectile.type === 'beam' && projectile.damage === KAMEHAMEHA_DMG_LVL3) {
                    damageToTake *= 0.35; 
                } else {
                    damageToTake *= 0.125; 
                }
                
                this.flashShield();
                if (projectile && projectile.type === 'beam' && projectile.damage === KAMEHAMEHA_DMG_LVL2) {
                    const pushbackDistance = projectile.owner.direction === 'right' ? 20 : -20;
                    this.startPushback(pushbackDistance, 250 / gameSpeedMultiplier);
                }
            } else {
                 this.flash('white');
                 if (damageToTake > 0) playSound('takeHitSfx');
            }
        } else {
             this.flash('white');
             // FIXED: Only play takeHitSfx for non-DoT damage
             if (damageToTake > 0 && (!projectile || projectile.type !== 'fireball')) playSound('takeHitSfx');
        }
        this.health = Math.max(0, this.health - damageToTake);
        
        if (damageToTake > 0) {
            this.ultimateCharge = Math.min(MAX_ULTIMATE_CHARGE, this.ultimateCharge + (damageToTake / 5));
        }
        
        const redThreshold = MAX_HEALTH * 0.2; // FIXED: Changed to 20%
        if (oldHealth > YELLOW_HEALTH_SEGMENT && this.health <= YELLOW_HEALTH_SEGMENT && !this.hasPlayedYellowHealthSfx) {
            playSound('yellowHealthSfx');
            this.hasPlayedYellowHealthSfx = true;
        }
        if (oldHealth > redThreshold && this.health <= redThreshold && !this.hasPlayedRedHealthSfx) {
            playSound('redHealthSfx');
            this.hasPlayedRedHealthSfx = true;
        }

        if (oldHealth > YELLOW_HEALTH_SEGMENT && this.health <= YELLOW_HEALTH_SEGMENT) {
            this.greenBarDepleted = true;
        }
        
        this.isHit = true;
        setTimeout(() => { this.isHit = false; }, 150 / gameSpeedMultiplier);

        if (damageToTake > 0) {
            const flyTextY = Math.max(20, this.y - 10);
            flyTexts.push(new FlyText({
                x: this.x + this.width / 2,
                y: flyTextY,
                text: `-${Math.round(damageToTake)}`,
                color: 'red',
                fontSize: 20
            }));
        }

        this.updateUI();
    }

    getAttackBox() {
        if (!this.isAttacking || !this.currentAttackType) return null;
        const attackRange = this.awakening.active && this.awakening.mode === 1 ? 6.75 : 1.75;
        const attackLength = 30 * attackRange; 
        const attackBoxX = this.direction === 'right' ? this.x + this.width : this.x - attackLength;
        
        if (this.currentAttackType === 'mid') {
            return { x: attackBoxX, y: this.y, width: attackLength, height: this.height * 0.6 };
        } else if (this.currentAttackType === 'low') {
            return { x: attackBoxX, y: this.y + this.height * 0.6, width: attackLength, height: this.height * 0.4 };
        }
        return null;
    }

    makeAIDecision(opponent) {
        const now = Date.now();
        if (now - this.aiLastDecisionTime < (AI_THINK_INTERVAL / gameSpeedMultiplier)) {
            return;
        }
        this.aiLastDecisionTime = now;

        this.isBlocking = false;
        this.isDucking = false;
        this.velocity.x = 0;

        const distanceX = this.x - opponent.x;
        const absDistanceX = Math.abs(distanceX);
        const isAILeftOfOpponent = this.x < opponent.x;

        const isAILowHealth = this.health / MAX_HEALTH < AI_LOW_HEALTH_THRESHOLD;

        // NEW: Awakening Logic
        if (!this.awakening.active) {
            if (this.ultimateCharge >= MAX_ULTIMATE_CHARGE) {
                const tacticalAdvantage = (this.health < opponent.health) || isAILowHealth;
                if (Math.random() < (tacticalAdvantage ? 0.7 : 0.4)) {
                    this.activateAwakening();
                    return; 
                }
            } else if (this.ultimateCharge >= MAX_ULTIMATE_CHARGE / 2) {
                if (Math.random() < 0.25) {
                    this.activateAwakening();
                    return; 
                }
            }
        }

        let targetMoveDirection = 0;

        if (isAILowHealth) {
            if (absDistanceX < AI_ATTACK_RANGE_FAR + 100) {
                targetMoveDirection = isAILeftOfOpponent ? -1 : 1;
            }
        } else {
            if (absDistanceX > AI_ATTACK_RANGE_FAR + 50) {
                targetMoveDirection = isAILeftOfOpponent ? 1 : -1;
            } else if (absDistanceX < AI_ATTACK_RANGE_CLOSE) {
                targetMoveDirection = isAILeftOfOpponent ? -1 : 1;
            }
        }
        
        if (targetMoveDirection === 1) {
            this.velocity.x = MOVE_SPEED;
        } else if (targetMoveDirection === -1) {
            this.velocity.x = -MOVE_SPEED;
        }

        const edgeBuffer = 50;
        const isAIAtLeftEdge = this.x < edgeBuffer;
        const isAIAtRightEdge = this.x + this.width > canvas.width - edgeBuffer;

        if ((isAIAtLeftEdge && !isAILeftOfOpponent) || (isAIAtRightEdge && isAILeftOfOpponent)) {
            if (this.teleportCharges > 0 && Math.random() < 0.8) {
                this.teleport();
                return;
            } else if (this.onGround && Math.random() < 0.6) {
                this.jump();
                return;
            } else if (Math.random() < 0.4) {
                this.dash(isAILeftOfOpponent ? 'left' : 'right');
                return;
            }
        }

        if (this.onGround && Math.random() < AI_JUMP_CHANCE) {
            this.jump();
        } else if (Math.random() < 0.15) {
            this.isDucking = true;
        }

        if (!this.isAttacking && this.attackCooldown <= 0) {
            if (absDistanceX < AI_ATTACK_RANGE_CLOSE + 20) {
                if (Math.random() < 0.6) this.midAttack();
                else this.lowAttack();
            } else if (this.powerCapacity >= FIREBALL_COST && absDistanceX < AI_ATTACK_RANGE_FAR + 50 && Math.random() < 0.7) {
                this.fireballAttack();
            } else if (this.powerCapacity >= LASER_COST && absDistanceX < AI_ATTACK_RANGE_FAR + 150 && Math.random() < 0.5) {
                this.laserAttack();
            } else if (this.powerCapacity >= LIGHTNING_COST && Math.random() < 0.3) {
                this.lightningAttack();
            } else if (this.powerCapacity >= KAMEHAMEHA_MIN_COST && absDistanceX > AI_ATTACK_RANGE_FAR + 100 && Math.random() < 0.2) {
                this.kamehamehaAttack();
            }
        }
        
        if (this.isChargingKamehameha && (now - this.kamehamehaChargeStartTime) > (1500 / gameSpeedMultiplier)) {
            this.releaseKamehameha();
        }

        if (opponent.isAttacking && Math.random() < AI_BLOCK_CHANCE) {
            this.isBlocking = true;
        }
    }
}

class Projectile {
    constructor({ x, y, radius = 0, color, velocity, owner, damage, type, width = 0, height = 0, duration = 0, stretchSpeed = 0, isInstantFullLength = false, freezeDuration = 0, outlineColor = null }) {
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.width = width;
        this.height = height;
        this.color = color;
        this.velocity = velocity;
        this.owner = owner;
        this.damage = damage;
        this.type = type;
        this.duration = duration;
        this.stretchSpeed = stretchSpeed;
        this.active = true;
        this.spawnTime = Date.now();
        this.hasSelfDamaged = false;
        this.isLifetimeSet = false;
        this.didHit = false;
        this.hasDealtDamage = false;
        this.isReflected = false;
        this.inClash = false;
        this.stopAnimation = false;
        this.freezeDuration = freezeDuration;
        this.outlineColor = outlineColor;

        this.isInstantFullLength = isInstantFullLength;
        if (this.type === 'beam' && this.stretchSpeed > 0 && !this.isInstantFullLength) {
            this.targetWidth = this.width;
            this.width = 0;
        }
    }

    draw() {
        ctx.save();
        if (this.type === 'beam' && this.owner === player1 && this.damage === KAMEHAMEHA_DMG_LVL3) {
            const coreHeight = this.height / 1.5;
            ctx.fillStyle = '#483D8B';
            ctx.fillRect(this.x, this.y, this.width, this.height);
            ctx.fillStyle = 'black';
            ctx.fillRect(this.x, this.y + (this.height - coreHeight) / 2, this.width, coreHeight);
        } 
        else if (this.type === 'beam' && this.owner === player2 && this.damage === KAMEHAMEHA_DMG_LVL3) {
            const coreHeight = this.height / 1.5;
            ctx.fillStyle = 'red';
            ctx.fillRect(this.x, this.y, this.width, this.height);
            ctx.fillStyle = 'white';
            ctx.fillRect(this.x, this.y + (this.height - coreHeight) / 2, this.width, coreHeight);
        }
        else if (this.type === 'lightning') {
            ctx.save();
            // Create a glowing effect
            ctx.shadowColor = this.color;
            ctx.shadowBlur = 15;
            
            // Use the outlineColor property passed from the attack function
            ctx.strokeStyle = this.outlineColor || 'cyan'; 
            
            // Set a different lineWidth if it's Player 2's awakened lightning
            if (this.outlineColor === '#800080') {
                ctx.lineWidth = 22.50; // Or any new thickness you want
            } else {
                ctx.lineWidth = 15; // The default thickness
            }
            
            ctx.beginPath();
            ctx.moveTo(this.x + this.width / 2, this.y); // Start at the top-center
            
            // Draw jagged segments down to the bottom
            for (let i = this.y; i < this.y + this.height; i += 10) {
                const randomX = this.x + (Math.random() * this.width);
                ctx.lineTo(randomX, i);
                
                // Add a chance for a small fork/branch to appear
                if (Math.random() > 0.90) {
                    const branchX = randomX + (Math.random() - 0.5) * 50;
                    const branchY = i + (Math.random() * 15);
                    ctx.moveTo(randomX, i); // Move back to the main bolt
                    ctx.lineTo(branchX, branchY); // Draw the branch
                }
            }
            ctx.stroke();
            
            // Draw a thinner, core bolt in the main color
            ctx.strokeStyle = this.color;
            ctx.lineWidth = 7.5;
            ctx.stroke(); // Re-stroke the same path with the new style
            
            ctx.restore();
        }
        else {
            ctx.fillStyle = this.color;
            if (this.type === 'fireball' || this.type === 'clash-winner-ball' || this.type === 'iceball') {
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
                ctx.fill();
                if (this.type === 'fireball') {
                    ctx.strokeStyle = this.owner === player1 ? 'skyblue' : 'yellow';
                    ctx.lineWidth = 2;
                    ctx.stroke();
                    
                    ctx.beginPath();
                    ctx.arc(this.x, this.y, 3, 0, Math.PI * 2);
                    ctx.fillStyle = this.owner === player1 ? 'orange' : 'red';
                    ctx.fill();
                }
            } else {
                ctx.fillRect(this.x, this.y, this.width, this.height);
            }
        }
        ctx.restore();
    }

    update() {
        if (this.inClash) {
            this.draw();
            return;
        }
        if (this.duration > 0 && (Date.now() - this.spawnTime) > this.duration) this.active = false;

        if (this.type === 'lightning') {
            if (this.height < canvas.height && !this.stopAnimation) {
                this.height += LIGHTNING_STRETCH_SPEED;
            }
        } else if (this.type === 'beam' && !this.isInstantFullLength) {
            if (this.width < this.targetWidth) {
                this.width += this.stretchSpeed;
                if (this.owner.direction === 'left') {
                    this.x = this.owner.x - this.width; 
                }
            } else {
                this.width = this.targetWidth;
            }
        } else {
            this.x += this.velocity.x * gameSpeedMultiplier;
            this.y += this.velocity.y * gameSpeedMultiplier;
        }
        
        if (this.type === 'fireball' && Math.random() < 0.9) {
            let mainColor, outlineColor, dotColor;
            if (this.owner === player1) {
                mainColor = 'rgba(0, 0, 128, 0.8)';      // Navy
                outlineColor = 'rgba(135, 206, 235, 0.8)'; // Sky Blue
                dotColor = 'rgba(255, 165, 0, 0.9)';     // Orange
            } else {
                mainColor = 'rgba(255, 165, 0, 0.8)';   // Orange
                outlineColor = 'rgba(255, 255, 0, 0.8)';   // Yellow
                dotColor = 'rgba(255, 0, 0, 0.9)';       // Red
            }

            // Randomly pick one of the three colors for each particle
            let particleColor;
            const rand = Math.random();
            if (rand < 0.45) {
                particleColor = mainColor;
            } else if (rand < 0.9) {
                particleColor = outlineColor;
            } else {
                particleColor = dotColor;
            }

            particles.push(new Particle({
                x: this.x + (Math.random() - 0.5) * this.radius,
                y: this.y + (Math.random() - 0.5) * this.radius,
                radius: Math.random() * 2 + 1,
                color: particleColor,
                velocity: {
                    x: (-this.velocity.x * 0.1 + (Math.random() - 0.5) * 1) * gameSpeedMultiplier,
                    y: (-this.velocity.y * 0.1 + (Math.random() - 0.5) * 1) * gameSpeedMultiplier
                },
                friction: 0.9
            }));
        }


        if (this.x > canvas.width + 100 || this.x < -100) this.active = false;
        this.draw();
    }

    getBounds() {
        return (this.type === 'fireball' || this.type === 'clash-winner-ball' || this.type === 'iceball')
            ? { x: this.x - this.radius, y: this.y - this.radius, width: this.radius * 2, height: this.radius * 2 }
            : { x: this.x, y: this.y, width: this.width, height: this.height };
    }
}

class Particle {
    constructor({ x, y, radius, color, velocity, friction = 1 }) {
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.color = color;
        this.velocity = velocity;
        this.alpha = 1;
        this.friction = friction;
    }

    draw() {
        ctx.save();
        ctx.globalAlpha = this.alpha;
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x, this.y, this.radius * 2, this.radius * 2);
        ctx.restore();
    }

    update() {
        this.velocity.x *= this.friction;
        this.velocity.y *= this.friction;
        this.x += this.velocity.x;
        this.y += this.velocity.y;
        this.alpha -= (0.03 * gameSpeedMultiplier);
        if (this.radius > 0.1) this.radius -= (0.05 * gameSpeedMultiplier);
        this.draw();
    }
}

class FlyText {
    constructor({ x, y, text, color, fontSize, duration = 1000 }) {
        this.x = x;
        this.y = y;
        this.text = text;
        this.color = color;
        this.fontSize = fontSize;
        this.alpha = 1;
        this.velocityY = -0.5 * gameSpeedMultiplier;
        this.lifetime = duration / gameSpeedMultiplier;
        this.spawnTime = Date.now();
    }

    draw() {
        uiCtx.save();
        uiCtx.globalAlpha = this.alpha;
        uiCtx.textAlign = 'center';
        uiCtx.textBaseline = 'middle';
        uiCtx.font = `bold ${this.fontSize}px 'Impact', 'Arial Black', sans-serif`;

        uiCtx.shadowColor = 'black';
        uiCtx.shadowBlur = 8;
        uiCtx.lineWidth = 2;
        uiCtx.strokeStyle = 'black';

        uiCtx.strokeText(this.text, this.x, this.y);
        uiCtx.fillStyle = this.color;
        uiCtx.fillText(this.text, this.x, this.y);
        
        uiCtx.restore();
    }

    update() {
        const elapsedTime = Date.now() - this.spawnTime;
        this.y += this.velocityY;
        this.alpha = 1 - (elapsedTime / this.lifetime);
        return this.alpha > 0;
    }
}

class Effect {
     constructor({ x, y, width, height, color, duration, type, owner, damage, target = null, onUpdate = null, onEnd = null }) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.color = color;
        this.duration = duration;
        this.type = type;
        this.owner = owner;
        this.damage = damage;
        this.target = target;
        this.active = true;
        this.spawnTime = Date.now();
        this.hasDealtDamage = false;
        this.hasSelfDamaged = false;
        this.onUpdate = onUpdate;
        this.onEnd = onEnd;
    }

    draw() {
        ctx.save();
        if (this.type === 'ultimate') {
            ctx.fillStyle = this.color;
            ctx.strokeStyle = this.owner === player1 ? 'blue' : 'red';
            ctx.lineWidth = 4;
            ctx.fillRect(this.x, this.y, this.width, this.height);
            ctx.strokeRect(this.x, this.y, this.width, this.height);
        } else if (this.type === 'clash-ball') {
            ctx.fillStyle = this.color;
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.width / 2, 0, Math.PI * 2);
            ctx.fill();
        } else if (this.type === 'screen-flash') {
            ctx.fillStyle = this.color;
            ctx.fillRect(this.x, this.y, this.width, this.height);
        }
        ctx.restore();
    }

    update() {
        const elapsedTime = Date.now() - this.spawnTime;
        if (elapsedTime > this.duration) {
            this.active = false;
            if (this.onEnd) this.onEnd();
            return;
        }
        if (this.onUpdate) this.onUpdate(elapsedTime / this.duration);
        this.draw();
    }

    getBounds() {
        if (this.type === 'clash-ball') {
            const radius = this.width / 2;
            return { x: this.x - radius, y: this.y - radius, width: this.width, height: this.height };
        }
        return { x: this.x, y: this.y, width: this.width, height: this.height };
    }
}

class IceWall {
    constructor({ x, y }) {
        this.x = x;
        this.y = y;
        this.width = 20; 
        this.height = 100; 
        this.color = 'rgba(210, 240, 255, 0.7)';
        this.active = true;
        this.shake = 0;
        this.shakeIntensity = 10;
        this.loopingSound = null;
        this.hasBeenHit = false;
        
        this.growthStage = 0; 
        this.hits = 0;
        this.maxHits = 3; 
        this.laserHits = 0;
        this.maxLaserHits = 1; 
    }

    draw() {
        ctx.save();
        const shakeX = (Math.random() - 0.5) * this.shake;
        const shakeY = (Math.random() - 0.5) * this.shake;
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x + shakeX, this.y + shakeY, this.width, this.height);

        ctx.strokeStyle = 'rgba(255, 255, 255, 0.8)';
        ctx.lineWidth = 1.5;
        const totalDamageRatio = (this.hits / this.maxHits) + (this.laserHits / this.maxLaserHits);
        const numCracks = Math.floor(totalDamageRatio * 10);
        for (let i = 0; i < numCracks; i++) {
            ctx.beginPath();
            ctx.moveTo(this.x + (Math.random() * this.width), this.y + (Math.random() * this.height));
            ctx.lineTo(this.x + (Math.random() * this.width), this.y + (Math.random() * this.height));
            ctx.stroke();
        }
        ctx.restore();
    }

    update() {
        if (this.shake > 0) {
            this.shake -= 1;
        }
        this.draw();
    }

    takeHit() { 
        if (!this.hasBeenHit) {
            this.hasBeenHit = true;
            if (!this.loopingSound) {
                this.loopingSound = new Audio(iceWallLoopSfx.src);
                this.loopingSound.loop = true;
                if (isSfxOn) this.loopingSound.play();
            }
        }
        this.hits++;
        this.shake = this.shakeIntensity;
        if (this.hits >= this.maxHits) {
            this.destroy();
        } else {
            if (this.growthStage < 2) playSound('iceWallHitSfx');
            else playSound('iceWallStrongHitSfx');
        }
    }
    
    takeLaserHit() { 
        if (!this.hasBeenHit) {
            this.hasBeenHit = true;
            if (!this.loopingSound) {
                this.loopingSound = new Audio(iceWallLoopSfx.src);
                this.loopingSound.loop = true;
                if (isSfxOn) this.loopingSound.play();
            }
        }
        if (this.maxLaserHits === Infinity) return;
        this.laserHits++;
        this.shake = this.shakeIntensity;
        if (this.laserHits >= this.maxLaserHits) {
            this.destroy();
        } else {
            if (this.growthStage < 2) playSound('iceWallHitSfx');
            else playSound('iceWallStrongHitSfx');
        }
    }

    destroy() {
        if (this.loopingSound) {
            this.loopingSound.pause();
            this.loopingSound = null;
        }
        this.active = false;
        playSound('iceWallBreakSfx');
        const numParticles = Math.floor((this.width * this.height) / 50); 
        for (let i = 0; i < numParticles; i++) {
            particles.push(new Particle({
                x: this.x + Math.random() * this.width,
                y: this.y + Math.random() * this.height,
                radius: Math.random() * 2 + 1,
                color: 'rgba(200, 220, 255, 0.9)',
                velocity: {
                    x: (Math.random() - 0.5) * 2,
                    y: (Math.random() - 0.5) * 2 
                },
                friction: 0.98
            }));
        }
    }

    grow() {
        const oldWidth = this.width;
        const oldHeight = this.height;
        this.growthStage++;

        if (this.growthStage === 1) { 
            this.height *= 1.5;
            this.width *= 1.75;
            this.maxHits = 6; 
            this.maxLaserHits = 2; 
        } else if (this.growthStage === 2) { 
            this.height *= 1.25;
            this.width *= 1.75;
            this.maxHits = 9; 
            this.maxLaserHits = Infinity; 
        } else { 
            this.height *= 1.5;
            this.width *= 1.25;
        }
        
        this.x -= (this.width - oldWidth) / 2;
        this.y -= (this.height - oldHeight) / 2;
    }
    
    getBounds() {
        return { x: this.x, y: this.y, width: this.width, height: this.height };
    }
}

let player1 = new Fighter({ x: 100, y: 0, width: 50, height: 80, color: 'blue', controls: { up: 'KeyW', left: 'KeyA', right: 'KeyD', duck: 'KeyS', block: 'ShiftLeft', attackMid: 'KeyT', attackLow: 'KeyY', kamehameha: 'Digit9', fireball: 'Digit6', lightning: 'Digit8', laser: 'Digit7', ultimate: 'Space', teleport: 'Digit5' } });
let player2 = new Fighter({ x: canvas.width - 150, y: 0, width: 50, height: 80, color: '#8B0000', controls: { up: 'ArrowUp', left: 'ArrowLeft', right: 'ArrowRight', duck: 'ArrowDown', block: 'ShiftRight', attackMid: 'NumpadAdd', attackLow: 'NumpadEnter', kamehameha: 'Numpad4', fireball: 'Numpad1', lightning: 'Numpad3', laser: 'Numpad2', teleport: 'Numpad5' }, direction: 'left' });

const keys = {};

window.addEventListener('keydown', (event) => {
    if (event.repeat) return;

    if (activeClash && activeClash.level === 3) {
        if (event.code === 'Digit9') player1.kamehamehaClashPresses++;
        if (event.code === 'Numpad4' && !player2.isAI) player2.kamehamehaClashPresses++;
    }
    
    if (Object.values(player1.controls).includes(event.code) && player1.isFrozen) return;
    if (Object.values(player2.controls).includes(event.code) && player2.isFrozen) return;

    keys[event.code] = true;
    
    const now = Date.now();
    
    // Player 1 Controls
    if (event.code === player1.controls.left) {
        if (now - player1.lastLeftPressTime < (DOUBLE_TAP_WINDOW / gameSpeedMultiplier)) player1.dash('left');
        player1.lastLeftPressTime = now;
    }
    if (event.code === player1.controls.right) {
        if (now - player1.lastRightPressTime < (DOUBLE_TAP_WINDOW / gameSpeedMultiplier)) player1.dash('right');
        player1.lastRightPressTime = now;
    }
    if (event.code === player1.controls.teleport) {
        if (player1.awakening.active && player1.awakening.mode === 1) {
            player1.isContinuouslyTeleporting = true;
            if (!player1.loopingSfx) {
                player1.loopingSfx = new Audio(teleportAwakenedSfx.src);
                player1.loopingSfx.loop = true;
                if (isSfxOn) player1.loopingSfx.play();
            }
        } else {
            player1.teleport();
        }
    }
    if (event.code === player1.controls.block) {
        player1.isBlocking = true;
        player1.blockReleaseIntent = false;
        playSound('blockUpSfx');
    }
    if (keys[player1.controls.block] && keys[player1.controls.ultimate]) {
        player1.activateAwakening();
    }
    // --- NEW: Keydown for Kamehameha ---
    if (event.code === player1.controls.kamehameha && !player1.isBlocking && !activeClash) {
        player1.kamehamehaAttack();
    }

    // Player 2 Controls
    if (gameMode === '2P' && !player2.isAI) {
         if (event.code === player2.controls.left) {
            if (now - player2.lastLeftPressTime < (DOUBLE_TAP_WINDOW / gameSpeedMultiplier)) player2.dash('left');
            player2.lastLeftPressTime = now;
        }
        if (event.code === player2.controls.right) {
            if (now - player2.lastRightPressTime < (DOUBLE_TAP_WINDOW / gameSpeedMultiplier)) player2.dash('right');
            player2.lastRightPressTime = now;
        }
        if (event.code === player2.controls.teleport) {
             if (player2.awakening.active && player2.awakening.mode === 1) {
                player2.isContinuouslyTeleporting = true;
                if (!player2.loopingSfx) {
                    player2.loopingSfx = new Audio(teleportAwakenedSfx.src);
                    player2.loopingSfx.loop = true;
                    if (isSfxOn) player2.loopingSfx.play();
                }
            } else {
                player2.teleport();
            }
        }
        if (event.code === player2.controls.block) {
            player2.isBlocking = true;
            playSound('blockUpSfx');
        }
        if (keys[player2.controls.block] && (keys[player2.controls.attackMid] || keys[player2.controls.attackLow])) {
            player2.activateAwakening();
        }
         if (keys[player2.controls.attackMid] && keys[player2.controls.attackLow]) {
            player2.ultimateAttack();
        }
        // --- NEW: Keydown for Kamehameha ---
        if (event.code === player2.controls.kamehameha && !player2.isBlocking && !activeClash) {
            player2.kamehamehaAttack();
        }
    }
});

window.addEventListener('keyup', (event) => {
    keys[event.code] = false;
    
    if (event.code === player1.controls.block) {
        player1.blockReleaseIntent = true;
        playSound('blockDownSfx');
    }
    if (gameMode === '2P' && !player2.isAI && event.code === player2.controls.block) {
        player2.isBlocking = false;
        playSound('blockDownSfx');
    }
    if (event.code === player1.controls.teleport) {
        player1.isContinuouslyTeleporting = false;
        if (player1.loopingSfx) {
            player1.loopingSfx.pause();
            player1.loopingSfx = null;
        }
    }
    if (gameMode === '2P' && !player2.isAI && event.code === player2.controls.teleport) {
        player2.isContinuouslyTeleporting = false;
         if (player2.loopingSfx) {
            player2.loopingSfx.pause();
            player2.loopingSfx = null;
        }
    }
    // --- NEW: Keyup for Kamehameha ---
    if (event.code === player1.controls.kamehameha) {
        if (player1.isChargingKamehameha) player1.releaseKamehameha();
    }
    if (gameMode === '2P' && !player2.isAI && event.code === player2.controls.kamehameha) {
        if (player2.isChargingKamehameha) player2.releaseKamehameha();
    }
});
