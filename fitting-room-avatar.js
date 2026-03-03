/**
 * LUXE RENTALS — fitting-room-avatar.js
 * Three.js Avatar System: Scene setup, human dummy mesh,
 * camera controls (drag/rotate/zoom), idle animation, outfit switching.
 */

/* ── Globals ────────────────────────────────────────────── */
let scene, camera, renderer, avatarGroup, clock;
let isDragging = false, prevMouse = { x: 0, y: 0 };
let rotY = 0, rotX = 0.1, camZ = 5.5;
let currentGender = 'female'; // 'female' | 'male'
let breathPhase = 0;
let rafId = null;

// Outfit slots — stores current Three.js mesh references
const outfitMeshes = { dress: null, necklace: null, earrings: null, bangles: null };

/* ── Init on DOM ready ──────────────────────────────────── */
window.addEventListener('DOMContentLoaded', initAvatar);

function initAvatar() {
    const canvas = document.getElementById('avatarCanvas');
    if (!canvas || typeof THREE === 'undefined') return;

    const stage = canvas.parentElement;

    // Scene
    scene = new THREE.Scene();
    clock = new THREE.Clock();

    // Camera
    camera = new THREE.PerspectiveCamera(45, stage.clientWidth / stage.clientHeight, 0.1, 100);
    camera.position.set(0, 1.2, camZ);
    camera.lookAt(0, 1.2, 0);

    // Renderer
    renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
    renderer.setSize(stage.clientWidth, stage.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;

    // Lights
    setupLights();

    // Floor shadow disc
    const floorGeo = new THREE.CircleGeometry(1.2, 64);
    const floorMat = new THREE.MeshStandardMaterial({
        color: 0x110010, transparent: true, opacity: 0.5,
        roughness: 0.9, metalness: 0.1
    });
    const floor = new THREE.Mesh(floorGeo, floorMat);
    floor.rotation.x = -Math.PI / 2;
    floor.receiveShadow = true;
    scene.add(floor);

    // Build avatar
    avatarGroup = new THREE.Group();
    scene.add(avatarGroup);
    buildAvatar('female');

    // Camera controls
    setupCameraControls(canvas);

    // Window resize
    window.addEventListener('resize', onResize);

    // Buttons
    document.getElementById('btnReset')?.addEventListener('click', resetCamera);
    document.getElementById('btnZoomIn')?.addEventListener('click', () => { camZ = Math.max(3, camZ - 0.5); });
    document.getElementById('btnZoomOut')?.addEventListener('click', () => { camZ = Math.min(9, camZ + 0.5); });
    document.getElementById('btnFemale')?.addEventListener('click', () => switchGender('female'));
    document.getElementById('btnMale')?.addEventListener('click', () => switchGender('male'));

    // Start render loop
    animate();

    // Hide canvas hint after 4s
    setTimeout(() => document.getElementById('canvasHint')?.classList.add('hidden'), 4000);
}

/* ── Lighting Setup ─────────────────────────────────────── */
function setupLights() {
    // Ambient
    scene.add(new THREE.AmbientLight(0x1a0a2e, 2.5));

    // Key light (soft warm)
    const key = new THREE.DirectionalLight(0xfff5ea, 3.5);
    key.position.set(3, 6, 4);
    key.castShadow = true;
    key.shadow.mapSize.set(512, 512);
    scene.add(key);

    // Rim light — red (left)
    const rimR = new THREE.PointLight(0x8B0000, 4, 8);
    rimR.position.set(-3, 3, -2);
    scene.add(rimR);

    // Rim light — purple (right)
    const rimP = new THREE.PointLight(0x4B0082, 3, 8);
    rimP.position.set(3, 2, -2);
    scene.add(rimP);

    // Fill light (front low)
    const fill = new THREE.PointLight(0xffeedd, 1.5, 6);
    fill.position.set(0, 0.5, 3);
    scene.add(fill);
}

/* ── Build Human Avatar ─────────────────────────────────── */
function buildAvatar(gender) {
    // Clear previous
    while (avatarGroup.children.length) avatarGroup.remove(avatarGroup.children[0]);

    const isFemale = gender === 'female';

    // Skin tone material
    const skin = new THREE.MeshStandardMaterial({ color: 0xdeb887, roughness: 0.7, metalness: 0.05 });
    const dark = new THREE.MeshStandardMaterial({ color: 0x1a0a0a, roughness: 0.4, metalness: 0.3 });

    const add = (geo, mat, x, y, z, rx = 0, ry = 0, rz = 0) => {
        const m = new THREE.Mesh(geo, mat);
        m.position.set(x, y, z);
        m.rotation.set(rx, ry, rz);
        m.castShadow = true;
        avatarGroup.add(m);
        return m;
    };

    // ── Body proportions (female vs male) ──
    const torsoW = isFemale ? 0.38 : 0.48;
    const hipsW = isFemale ? 0.42 : 0.40;
    const torsoH = isFemale ? 0.72 : 0.80;

    // Head
    add(new THREE.SphereGeometry(0.18, 20, 20), skin, 0, 2.8, 0);
    // Hair
    const hairMat = new THREE.MeshStandardMaterial({ color: isFemale ? 0x1a0a00 : 0x0d0700, roughness: 0.9 });
    if (isFemale) {
        add(new THREE.SphereGeometry(0.19, 16, 16), hairMat, 0, 2.88, 0);
        add(new THREE.CylinderGeometry(0.10, 0.06, 0.36, 12), hairMat, 0, 2.6, -0.08);
    } else {
        add(new THREE.SphereGeometry(0.185, 16, 12), hairMat, 0, 2.87, 0);
    }

    // Neck
    add(new THREE.CylinderGeometry(0.07, 0.09, 0.18, 12), skin, 0, 2.55, 0);

    // Torso
    add(new THREE.CylinderGeometry(torsoW * 0.85, torsoW, torsoH, 16), dark, 0, 1.9, 0);

    // Hips / pelvis
    add(new THREE.CylinderGeometry(hipsW, hipsW * 0.85, 0.30, 16), dark, 0, 1.45, 0);

    // Shoulders
    add(new THREE.SphereGeometry(0.13, 10, 10), skin, -torsoW - 0.05, 2.32, 0);
    add(new THREE.SphereGeometry(0.13, 10, 10), skin, torsoW + 0.05, 2.32, 0);

    // Upper arms
    const armH = isFemale ? 0.46 : 0.50;
    add(new THREE.CylinderGeometry(0.075, 0.065, armH, 10), dark, -(torsoW + 0.12), 2.05, 0, 0, 0, 0.15);
    add(new THREE.CylinderGeometry(0.075, 0.065, armH, 10), dark, (torsoW + 0.12), 2.05, 0, 0, 0, -0.15);

    // Elbows
    add(new THREE.SphereGeometry(0.065, 8, 8), skin, -(torsoW + 0.16), 1.8, 0);
    add(new THREE.SphereGeometry(0.065, 8, 8), skin, (torsoW + 0.16), 1.8, 0);

    // Forearms
    add(new THREE.CylinderGeometry(0.055, 0.045, 0.42, 10), skin, -(torsoW + 0.18), 1.58, 0, 0, 0, -0.08);
    add(new THREE.CylinderGeometry(0.055, 0.045, 0.42, 10), skin, (torsoW + 0.18), 1.58, 0, 0, 0, 0.08);

    // Hands
    add(new THREE.SphereGeometry(0.07, 8, 8), skin, -(torsoW + 0.20), 1.34, 0);
    add(new THREE.SphereGeometry(0.07, 8, 8), skin, (torsoW + 0.20), 1.34, 0);

    // Upper legs
    const legGap = isFemale ? 0.14 : 0.18;
    add(new THREE.CylinderGeometry(0.13, 0.10, 0.60, 12), dark, -legGap, 1.02, 0);
    add(new THREE.CylinderGeometry(0.13, 0.10, 0.60, 12), dark, legGap, 1.02, 0);

    // Knees
    add(new THREE.SphereGeometry(0.10, 8, 8), skin, -legGap, 0.70, 0);
    add(new THREE.SphereGeometry(0.10, 8, 8), skin, legGap, 0.70, 0);

    // Lower legs
    add(new THREE.CylinderGeometry(0.085, 0.06, 0.58, 12), dark, -legGap, 0.40, 0.02);
    add(new THREE.CylinderGeometry(0.085, 0.06, 0.58, 12), dark, legGap, 0.40, 0.02);

    // Feet
    add(new THREE.BoxGeometry(0.14, 0.06, 0.22), dark, -legGap, 0.05, 0.05);
    add(new THREE.BoxGeometry(0.14, 0.06, 0.22), dark, legGap, 0.05, 0.05);

    // If female, add subtle bust shape
    if (isFemale) {
        const bustMat = new THREE.MeshStandardMaterial({ color: 0xd2a679, roughness: 0.6 });
        add(new THREE.SphereGeometry(0.09, 10, 8), bustMat, -0.11, 2.22, 0.18);
        add(new THREE.SphereGeometry(0.09, 10, 8), bustMat, 0.11, 2.22, 0.18);
    }
}

/* ── Apply Outfit to Avatar ─────────────────────────────── */
window.applyOutfit = function (type, data) {
    if (!scene || !avatarGroup) return;

    // Flash animation
    const flash = document.getElementById('outfitFlash');
    if (flash) {
        flash.classList.add('active');
        setTimeout(() => flash.classList.remove('active'), 300);
    }

    // Remove existing mesh for this slot
    if (outfitMeshes[type]) {
        avatarGroup.remove(outfitMeshes[type]);
        outfitMeshes[type] = null;
    }

    if (!data) return; // Clear only

    const color = new THREE.Color(data.color);
    const mat = new THREE.MeshStandardMaterial({
        color,
        roughness: 0.55,
        metalness: data.type === 'necklace' || data.type === 'earrings' || data.type === 'bangles' ? 0.8 : 0.05,
        opacity: 0,
        transparent: true
    });

    let mesh;
    const isFemale = currentGender === 'female';
    const torsoW = isFemale ? 0.38 : 0.48;

    if (type === 'dress') {
        // Full dress — tapered cylinder from hips to ankles
        const geo = new THREE.CylinderGeometry(0.50, 0.65, 2.0, 20, 1, true);
        mesh = new THREE.Mesh(geo, mat);
        mesh.position.set(0, 1.0, 0);
        // Fabric shimmer effect
        mat.side = THREE.DoubleSide;
        mat.roughness = 0.45;
    } else if (type === 'necklace') {
        const geo = new THREE.TorusGeometry(0.14, 0.016, 10, 40);
        mesh = new THREE.Mesh(geo, mat);
        mesh.position.set(0, 2.62, 0.08);
        mesh.rotation.x = Math.PI / 2.5;
        mat.metalness = 0.9; mat.roughness = 0.15;
    } else if (type === 'earrings') {
        const group = new THREE.Group();
        const earGeo = new THREE.SphereGeometry(0.032, 8, 8);
        const earL = new THREE.Mesh(earGeo, mat);
        const earR = new THREE.Mesh(earGeo, mat);
        earL.position.set(-0.19, 2.73, 0);
        earR.position.set(0.19, 2.73, 0);
        // Add drop
        const dropGeo = new THREE.CylinderGeometry(0.012, 0.022, 0.10, 8);
        const dropL = new THREE.Mesh(dropGeo, mat);
        const dropR = new THREE.Mesh(dropGeo, mat);
        dropL.position.set(-0.19, 2.64, 0);
        dropR.position.set(0.19, 2.64, 0);
        group.add(earL, earR, dropL, dropR);
        mat.metalness = 0.85; mat.roughness = 0.1;
        avatarGroup.add(group);
        outfitMeshes[type] = group;
        fadeInMesh(group);
        return;
    } else if (type === 'bangles') {
        const group = new THREE.Group();
        for (let i = 0; i < 3; i++) {
            const g = new THREE.TorusGeometry(0.076, 0.012, 8, 30);
            const b = new THREE.Mesh(g, mat.clone());
            b.position.set(torsoW + 0.18, 1.34 - i * 0.025, 0);
            b.rotation.x = Math.PI / 2;
            group.add(b);
        }
        mat.metalness = 0.9; mat.roughness = 0.1;
        avatarGroup.add(group);
        outfitMeshes[type] = group;
        fadeInMesh(group);
        return;
    }

    if (mesh) {
        mesh.castShadow = true;
        avatarGroup.add(mesh);
        outfitMeshes[type] = mesh;
        fadeInMesh(mesh);
    }
};

function fadeInMesh(obj) {
    // Fade in via opacity 0→1
    let progress = 0;
    const interval = setInterval(() => {
        progress += 0.08;
        obj.traverse(c => {
            if (c.isMesh && c.material.transparent) c.material.opacity = Math.min(progress, 1);
        });
        if (progress >= 1) {
            clearInterval(interval);
            obj.traverse(c => {
                if (c.isMesh) c.material.transparent = false;
            });
        }
    }, 16);
}

window.clearOutfitSlot = function (type) {
    if (outfitMeshes[type]) {
        avatarGroup.remove(outfitMeshes[type]);
        outfitMeshes[type] = null;
    }
};

/* ── Camera Controls ────────────────────────────────────── */
function setupCameraControls(canvas) {
    // Mouse
    canvas.addEventListener('mousedown', e => { isDragging = true; prevMouse = { x: e.clientX, y: e.clientY }; });
    window.addEventListener('mouseup', () => { isDragging = false; });
    window.addEventListener('mousemove', e => {
        if (!isDragging) return;
        const dx = e.clientX - prevMouse.x;
        const dy = e.clientY - prevMouse.y;
        rotY += dx * 0.008;
        rotX = Math.max(-0.4, Math.min(0.6, rotX + dy * 0.005));
        prevMouse = { x: e.clientX, y: e.clientY };
    });
    canvas.addEventListener('wheel', e => {
        e.preventDefault();
        camZ = Math.max(3, Math.min(9, camZ + e.deltaY * 0.006));
    }, { passive: false });

    // Touch
    let lastTouch = null, pinchDist = 0;
    canvas.addEventListener('touchstart', e => {
        if (e.touches.length === 1) { isDragging = true; lastTouch = { x: e.touches[0].clientX, y: e.touches[0].clientY }; }
        if (e.touches.length === 2) { pinchDist = getTouchDist(e); isDragging = false; }
    });
    canvas.addEventListener('touchmove', e => {
        e.preventDefault();
        if (e.touches.length === 1 && isDragging && lastTouch) {
            const dx = e.touches[0].clientX - lastTouch.x;
            const dy = e.touches[0].clientY - lastTouch.y;
            rotY += dx * 0.01;
            rotX = Math.max(-0.4, Math.min(0.6, rotX + dy * 0.006));
            lastTouch = { x: e.touches[0].clientX, y: e.touches[0].clientY };
        }
        if (e.touches.length === 2) {
            const d = getTouchDist(e);
            camZ = Math.max(3, Math.min(9, camZ - (d - pinchDist) * 0.015));
            pinchDist = d;
        }
    }, { passive: false });
    canvas.addEventListener('touchend', () => { isDragging = false; lastTouch = null; });
}

function getTouchDist(e) {
    const dx = e.touches[0].clientX - e.touches[1].clientX;
    const dy = e.touches[0].clientY - e.touches[1].clientY;
    return Math.sqrt(dx * dx + dy * dy);
}

function resetCamera() {
    rotY = 0; rotX = 0.1; camZ = 5.5;
}

/* ── Gender Switch ──────────────────────────────────────── */
function switchGender(gender) {
    if (gender === currentGender) return;
    currentGender = gender;

    // Save outfit references and reapply after rebuild
    const savedOutfits = {};
    // We store data on the items for reapplication via UI
    document.querySelectorAll('.fr-item.selected').forEach(el => {
        savedOutfits[el.dataset.type] = el.dataset;
    });

    // Flash
    const flash = document.getElementById('outfitFlash');
    if (flash) { flash.classList.add('active'); setTimeout(() => flash.classList.remove('active'), 400); }

    // Clear outfit meshes (will be rebuilt)
    Object.keys(outfitMeshes).forEach(k => {
        if (outfitMeshes[k]) { avatarGroup.remove(outfitMeshes[k]); outfitMeshes[k] = null; }
    });

    buildAvatar(gender);

    // Reapply saved outfits
    Object.keys(savedOutfits).forEach(type => {
        const d = savedOutfits[type];
        if (d) window.applyOutfit(type, d);
    });

    // Update summary
    document.getElementById('summaryAvatar').innerHTML = `<span class="fr-summary-icon">${gender === 'female' ? '♀' : '♂'}</span> ${gender.charAt(0).toUpperCase() + gender.slice(1)}`;

    // Toggle button states
    document.querySelectorAll('.fr-avatar-btn').forEach(b => b.classList.toggle('active', b.dataset.gender === gender));
}

/* ── Animation Loop ─────────────────────────────────────── */
function animate() {
    rafId = requestAnimationFrame(animate);
    const dt = clock.getDelta();

    // Idle breathing
    breathPhase += dt * 1.2;
    if (avatarGroup) {
        avatarGroup.scale.y = 1 + Math.sin(breathPhase) * 0.004;
        avatarGroup.scale.x = 1 - Math.sin(breathPhase) * 0.002;
        // Gentle sway
        avatarGroup.rotation.z = Math.sin(breathPhase * 0.5) * 0.005;
    }

    // Camera orbit
    camera.position.x = Math.sin(rotY) * Math.sin(Math.PI / 2 - rotX) * camZ;
    camera.position.z = Math.cos(rotY) * Math.sin(Math.PI / 2 - rotX) * camZ;
    camera.position.y = Math.cos(Math.PI / 2 - rotX) * camZ + 1.2;
    camera.lookAt(0, 1.5, 0);

    renderer.render(scene, camera);
}

/* ── Resize Handler ─────────────────────────────────────── */
function onResize() {
    const stage = document.getElementById('avatarCanvas')?.parentElement;
    if (!stage || !renderer) return;
    const w = stage.clientWidth, h = stage.clientHeight;
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    renderer.setSize(w, h);
}
