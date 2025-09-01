let handPose;
let faceMesh;

let video;

let faceOptions = { maxFaces: 2, refineLandmarks: false, flipped: true };
let faces = [];
let connectionsFace;

let hands = [];
let connectionsHand;

function preload(){
    handPose = ml5.handPose({flipped: true});
    faceMesh = ml5.faceMesh(faceOptions);
}

function setup() {
    createCanvas(680, 460);
    video = createCapture(VIDEO, {flipped: true});
    video.size(width, height);
    video.hide();
    connectionsHand = handPose.getConnections();

    handPose.detectStart(video, gotHands);
    faceMesh.detectStart(video, gotFaces);
}

function gotFaces(results) {
    faces = results;
}

function gotHands(results) {
    hands = results;
}

function draw() {
    background(30);
    //image(video, 0, 0, width, height); // uncomment to show video feed
    for (let i = 0; i < faces.length; i++) {
        let face = faces[i];
        for (let j = 0; j < face.keypoints.length; j++) {
            let keypoint = face.keypoints[j];
            fill(0, 255, 0);
            noStroke();
            circle(keypoint.x, keypoint.y, 2);
        }
    }

    for (let i = 0; i < hands.length; i++) {
        let hand = hands[i];
        // Draw skeletal connections first so keypoint circles render on top
        if (connectionsHand && connectionsHand.length && hand.keypoints && hand.keypoints.length) {
            stroke(0, 255, 0);
            strokeWeight(1);
            noFill();
            for (let c = 0; c < connectionsHand.length; c++) {
                const [a, b] = connectionsHand[c];
                const kpA = hand.keypoints[a];
                const kpB = hand.keypoints[b];
                if (kpA && kpB) {
                    line(kpA.x, kpA.y, kpB.x, kpB.y);
                }
            }
        }
        for (let j = 0; j < hand.keypoints.length; j++) {
            let keypoint = hand.keypoints[j];
            fill(0, 255, 0);
            noStroke();
            circle(keypoint.x, keypoint.y, 2);
        }
    }
}
