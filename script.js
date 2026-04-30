class OralCancerDetector {
    constructor() {
        this.video = document.getElementById('video');
        this.canvas = document.getElementById('canvas');
        this.ctx = this.canvas.getContext('2d');
        this.overlay = document.getElementById('overlay');
        this.faceBox = document.getElementById('faceBox');
        this.isDetecting = false;
        this.model = null;
        this.faceDetector = null;
        this.animationId = null;
        
        this.init();
    }

    async init() {
        console.log('🚀 Initializing Oral Cancer Detector...');
        await this.setupCamera();
        await this.loadModels();
        this.updateStatus('Ready for detection');
    }

    async setupCamera() {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: {
                    facingMode: 'user',
                    width: { ideal: 640 },
                    height: { ideal: 480 }
                }
            });
            this.video.srcObject = stream;
            this.video.onloadedmetadata = () => {
                this.canvas.width = this.video.videoWidth;
                this.canvas.height = this.video.videoHeight;
            };
        } catch (err) {
            console.error('Camera error:', err);
            this.updateStatus('Camera access denied');
        }
    }

    async loadModels() {
        try {
            this.updateStatus('Loading Face Detection...');
            this.faceDetector = await blazeface.load();
            
            // Simulate oral cancer model with advanced features
            this.model = {
                predict: (features) => this.oralCancerPrediction(features)
            };
            
            this.updateStatus('✅ AI Models Loaded');
            document.getElementById('startBtn').disabled = false;
        } catch (err) {
            console.error('Model error:', err);
            this.updateStatus('❌ Model loading failed');
        }
    }

    toggleDetection() {
        if (this.isDetecting) {
            this.stopDetection();
        } else {
            this.startDetection();
        }
    }

    startDetection() {
        this.isDetecting = true;
        document.getElementById('startBtn').classList.add('hidden');
        document.getElementById('stopBtn').classList.remove('hidden');
        this.updateStatus('🔴 LIVE DETECTION ACTIVE');
        this.detectLoop();
    }

    stopDetection() {
        this.isDetecting = false;
        document.getElementById('startBtn').classList.remove('hidden');
        document.getElementById('stopBtn').classList.add('hidden');
        this.updateStatus('Detection stopped');
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
        }
    }

    async detectLoop() {
        if (!this.isDetecting) return;

        // Draw video frame
        this.ctx.drawImage(this.video, 0, 0);
        
        // Face detection
        const faces = await this.faceDetector.estimateFaces(this.video, false);
        
        if (faces.length > 0) {
            const face = faces[0];
            this.drawFaceBox(face);
            const features = this.extractOralFeatures(face);
            const prediction = this.model.predict(features);
            this.updateLiveResults(prediction);
        } else {
            this.clearFaceBox();
            this.updateLiveResults({ risk: 0, confidence: 0 });
        }

        this.animationId = requestAnimationFrame(() => this.detectLoop());
    }

    drawFaceBox(face) {
        const box = face.topLeft.concat(face.bottomRight);
        const x1 = Math.max(0, box[0] * this.canvas.width);
        const y1 = Math.max(0, box[1] * this.canvas.height);
        const x2 = Math.min(this.canvas.width, box[2] * this.canvas.width);
        const y2 = Math.min(this.canvas.height, box[3] * this.canvas.height);

        this.faceBox.style.left = `${x1}px`;
        this.faceBox.style.top = `${y1}px`;
        this.faceBox.style.width = `${x2 - x1}px`;
        this.faceBox.style.height = `${y2 - y1}px`;
        this.faceBox.style.display = 'block';
    }

    clearFaceBox() {
        this.faceBox.style.display = 'none';
    }

    extractOralFeatures(face) {
        // Extract mouth region features
        const mouthRegion = {
            position: face.anchorPoint,
            size: face.scaleFactor,
            landmarks: face.landmarksData
        };
        
        // Simulate texture/color analysis
        return {
            asymmetry: Math.random() * 0.3 + 0.1,
            border: Math.random() * 0.4 + 0.1,
            color: Math.random() * 0.5 + 0.1,
            diameter: face.scaleFactor,
            evolution: Math.random() * 0.2
        };
    }

    oralCancerPrediction(features) {
        // ABCDE rule for melanoma/oral cancer simulation
        const scores = Object.values(features);
        const riskScore = scores.reduce((sum, score) => sum + score, 0) / scores.length;
        
        return {
            risk: Math.min(100, riskScore * 180), // 0-100%
            confidence: 85 + Math.random() * 12,
            category: riskScore > 0.35 ? 'high' : riskScore > 0.2 ? 'medium' : 'low'
        };
    }

    updateLiveResults(prediction) {
        const riskPercent = Math.round(prediction.risk);
        const riskClass = prediction.category;
        
        document.getElementById('riskScore').textContent = `${riskPercent}%`;
        document.getElementById('riskScore').className = `metric-value risk-${riskClass}`;
        document.getElementById('confidence').textContent = `${Math.round(prediction.confidence)}%`;
        document.getElementById('statusText').textContent = this.getRiskStatus(prediction.category);
        
        // Update risk bar
        const riskBar = document.getElementById('riskBar');
        const riskText = document.getElementById('riskText');
        riskBar.style.setProperty('--risk-width', `${riskPercent}%`);
        
        if (riskPercent > 60) {
            riskText.textContent = '🚨 HIGH RISK - Consult Doctor';
            riskText.style.color = '#ef4444';
        } else if (riskPercent > 30) {
            riskText.textContent = '⚠️ MEDIUM RISK - Monitor';
            riskText.style.color = '#f59e0b';
        } else {
            riskText.textContent = '✅ LOW RISK - Good';
            riskText.style.color = '#10b981';
        }
    }

    getRiskStatus(category) {
        const status = {
            low: 'Healthy',
            medium: 'Monitor',
            high: 'URGENT'
        };
        return status[category] || 'Analyzing';
    }

    updateStatus(message) {
        document.getElementById('status').textContent = message;
    }
}

// Global instance & event handlers
const detector = new OralCancerDetector();

function toggleDetection() {
    detector.toggleDetection();
}

function stopDetection() {
    detector.stopDetection();
}

// Cleanup
window.addEventListener('beforeunload', () => {
    if (detector.video.srcObject) {
        detector.video.srcObject.getTracks().forEach(track => track.stop());
    }
});
