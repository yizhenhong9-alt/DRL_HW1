document.addEventListener('DOMContentLoaded', () => {
    // === 1. Configuration & State ===
    let gridSize = 5;
    let currentMode = 'start';
    let startPoint = null;
    let endPoint = null;
    let obstacles = new Set();
    let maxObstacles = gridSize - 2;
    let currentValuesPE = [];
    let currentValuesVI = [];
    let isAutoRunning = false;
    let isEnvironmentLocked = false;
    const arrows = ['↑', '↓', '←', '→'];

    // === 2. DOM Elements ===
    const gridSizeInput = document.getElementById('grid-size');
    const generateBtn = document.getElementById('generate-btn');
    const dimSection = document.getElementById('dimension-section');
    const modeBtns = document.querySelectorAll('.mode-btn');
    const startStatus = document.getElementById('start-status');
    const endStatus = document.getElementById('end-status');
    const obstacleInfo = document.getElementById('obstacle-info');
    const resetBtn = document.getElementById('reset-btn');
    const confirmEnvBtn = document.getElementById('confirm-env-btn');
    const genPolicyBtn = document.getElementById('gen-policy-btn');
    const autoBtn = document.getElementById('auto-btn');
    const viBtn = document.getElementById('vi-btn');
    const stopBtn = document.getElementById('stop-btn');
    const envSection = document.getElementById('env-setup-section');
    const policySection = document.getElementById('policy-setup-section');
    const instText = document.getElementById('inst-text');
    const sizeInfo = document.getElementById('current-size-info');

    // Grids & Blocks
    const blockSetup = document.getElementById('block-setup');
    const blockPE = document.getElementById('block-pe');
    const blockVI = document.getElementById('block-vi');
    const miniMapBlock = document.getElementById('mini-map-block');
    const gridSetup = document.getElementById('grid-setup');
    const gridPE = document.getElementById('grid-pe');
    const gridVI = document.getElementById('grid-vi');
    const gridMini = document.getElementById('grid-mini');
    const peStatus = document.getElementById('pe-status-text');
    const viStatus = document.getElementById('vi-status-text');

    // === 3. Grid Management Functions ===
    function createGridElements(container, isInteractive = false) {
        const isMini = container.classList.contains('mini');
        const cellSize = isMini ? 20 : 42;
        container.style.gridTemplateColumns = `repeat(${gridSize}, ${cellSize}px)`;
        container.innerHTML = '';
        for (let r = 0; r < gridSize; r++) {
            for (let c = 0; c < gridSize; c++) {
                const cell = document.createElement('div');
                cell.className = 'cell';
                cell.dataset.row = r;
                cell.dataset.col = c;

                const coordEl = document.createElement('span');
                coordEl.className = 'cell-coord';
                coordEl.textContent = `${r},${c}`;
                coordEl.style.display = (isInteractive && !isMini) ? 'block' : 'none';

                const labelEl = document.createElement('span');
                labelEl.className = 'cell-label';

                const arrowEl = document.createElement('span');
                arrowEl.className = 'policy-arrow';
                arrowEl.style.display = 'none';

                const valueEl = document.createElement('span');
                valueEl.className = 'value-text';
                valueEl.style.display = 'none';

                cell.appendChild(coordEl);
                cell.appendChild(labelEl);
                cell.appendChild(arrowEl);
                cell.appendChild(valueEl);
                container.appendChild(cell);
            }
        }
    }

    function generateGrid() {
        let n = parseInt(gridSizeInput.value);
        if (n < 5) n = 5;
        if (n > 9) n = 9;
        gridSizeInput.value = n;
        gridSize = n;
        maxObstacles = n - 2;

        sizeInfo.textContent = `Grid size: ${n} x ${n}`;
        dimSection.style.display = 'none';

        resetEnvironment();
        createGridElements(gridSetup, true);
    }

    function handleCellClick(r, c, id, cell) {
        if (isEnvironmentLocked) return;
        const labelEl = cell.querySelector('.cell-label');

        if (currentMode === 'start') {
            if (startPoint === id) {
                startPoint = null;
                cell.classList.remove('start');
                labelEl.textContent = '';
            } else {
                const prevStart = gridSetup.querySelector('.cell.start');
                if (prevStart) {
                    prevStart.classList.remove('start');
                    prevStart.querySelector('.cell-label').textContent = '';
                }
                if (endPoint === id) endPoint = null;
                obstacles.delete(id);
                cell.classList.remove('end', 'obstacle');
                startPoint = id;
                cell.classList.add('start');
                labelEl.textContent = 'START';
            }
        } else if (currentMode === 'end') {
            if (endPoint === id) {
                endPoint = null;
                cell.classList.remove('end');
                labelEl.textContent = '';
            } else {
                const prevEnd = gridSetup.querySelector('.cell.end');
                if (prevEnd) {
                    prevEnd.classList.remove('end');
                    prevEnd.querySelector('.cell-label').textContent = '';
                }
                if (startPoint === id) startPoint = null;
                obstacles.delete(id);
                cell.classList.remove('start', 'obstacle');
                endPoint = id;
                cell.classList.add('end');
                labelEl.textContent = 'END';
            }
        } else if (currentMode === 'obstacle') {
            if (obstacles.has(id)) {
                obstacles.delete(id);
                cell.classList.remove('obstacle');
                labelEl.textContent = '';
            } else {
                if (obstacles.size >= maxObstacles) {
                    alert(`Max ${maxObstacles} obstacles.`);
                    return;
                }
                if (startPoint === id) startPoint = null;
                if (endPoint === id) endPoint = null;
                cell.classList.remove('start', 'end');
                obstacles.add(id);
                cell.classList.add('obstacle');
                labelEl.textContent = 'OBST';
            }
        }
        updateStatus();
    }

    function lockEnvironment() {
        if (!startPoint || !endPoint || obstacles.size !== maxObstacles) {
            alert("Set Start, End and all Obstacles.");
            return;
        }
        isEnvironmentLocked = true;
        envSection.style.display = 'none';
        policySection.style.display = 'block';
        confirmEnvBtn.style.display = 'none';

        // Prepare dual result grids + mini map
        blockSetup.style.display = 'none';
        blockPE.style.display = 'flex';
        blockVI.style.display = 'flex';
        miniMapBlock.style.display = 'flex';

        createGridElements(gridPE);
        createGridElements(gridVI);
        createGridElements(gridMini);
        syncEnvToResults();

        instText.textContent = "Environment locked. Mini-map pinned to sidebar.";
    }

    function syncEnvToResults() {
        [gridPE, gridVI, gridMini].forEach(container => {
            for (let r = 0; r < gridSize; r++) {
                for (let c = 0; c < gridSize; c++) {
                    const setupCell = gridSetup.querySelector(`.cell[data-row="${r}"][data-col="${c}"]`);
                    const targetCell = container.querySelector(`.cell[data-row="${r}"][data-col="${c}"]`);
                    targetCell.className = setupCell.className;
                    const label = setupCell.querySelector('.cell-label').textContent;
                    targetCell.querySelector('.cell-label').textContent = label;
                }
            }
        });
    }

    function generateRandomPolicy() {
        gridPE.querySelectorAll('.cell').forEach(cell => {
            const arrowEl = cell.querySelector('.policy-arrow');
            const valEl = cell.querySelector('.value-text');
            if (!cell.classList.contains('end') && !cell.classList.contains('obstacle')) {
                arrowEl.textContent = arrows[Math.floor(Math.random() * arrows.length)];
                arrowEl.style.display = 'block';
                valEl.textContent = '0.00';
                valEl.style.display = 'block';
            }
        });
        autoBtn.style.display = 'block';
        viBtn.style.display = 'block';
        instText.textContent = "Policy generated. Use buttons below to start.";
    }

    function updateStatus() {
        startStatus.textContent = startPoint ? `Start: (${startPoint.replace('-', ',')})` : 'Start: Not Set';
        endStatus.textContent = endPoint ? `End: (${endPoint.replace('-', ',')})` : 'End: Not Set';
        obstacleInfo.textContent = `Obst: ${obstacles.size}/${maxObstacles}`;
    }

    function resetEnvironment() {
        stopAuto();
        isEnvironmentLocked = false;
        startPoint = null;
        endPoint = null;
        obstacles.clear();
        currentValuesPE = Array.from({ length: gridSize }, () => Array(gridSize).fill(0.0));
        currentValuesVI = Array.from({ length: gridSize }, () => Array(gridSize).fill(0.0));

        blockSetup.style.display = 'flex';
        blockPE.style.display = 'none';
        blockVI.style.display = 'none';
        miniMapBlock.style.display = 'none';
        peStatus.textContent = '';
        viStatus.textContent = '';

        envSection.style.display = 'flex';
        policySection.style.display = 'none';
        confirmEnvBtn.style.display = 'block';
        resetBtn.style.display = 'block';
        updateStatus();
    }

    function hardReset() {
        gridSetup.innerHTML = '';
        sizeInfo.textContent = '';
        dimSection.style.display = 'block';
        envSection.style.display = 'none';
        policySection.style.display = 'none';
        confirmEnvBtn.style.display = 'none';
        resetBtn.style.display = 'none';
        blockSetup.style.display = 'flex';
        blockPE.style.display = 'none';
        blockVI.style.display = 'none';
        miniMapBlock.style.display = 'none';
    }

    function updateValueDisplay(container, values) {
        for (let r = 0; r < gridSize; r++) {
            for (let c = 0; c < gridSize; c++) {
                const cell = container.querySelector(`.cell[data-row="${r}"][data-col="${c}"]`);
                if (cell) {
                    const valueEl = cell.querySelector('.value-text');
                    valueEl.textContent = values[r][c].toFixed(2);
                    valueEl.style.display = 'block';
                    const val = values[r][c];
                    if (val > 0) {
                        cell.style.backgroundColor = `rgba(46, 160, 67, ${Math.min(val / 10, 0.5)})`;
                    } else if (val < 0) {
                        cell.style.backgroundColor = `rgba(248, 81, 73, ${Math.min(Math.abs(val) / 10, 0.5)})`;
                    }
                }
            }
        }
    }

    async function runPolicyEval() {
        const policyMatrix = [];
        gridPE.querySelectorAll('.cell').forEach(cell => {
            const r = parseInt(cell.dataset.row);
            const c = parseInt(cell.dataset.col);
            if (!policyMatrix[r]) policyMatrix[r] = [];
            policyMatrix[r][c] = cell.querySelector('.policy-arrow').textContent || "•";
        });

        const data = {
            gridSize,
            end: endPoint.split('-').map(Number),
            obstacles: Array.from(obstacles).map(o => o.split('-').map(Number)),
            policy: policyMatrix
        };

        const response = await fetch('/converge_policy_eval', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        const result = await response.json();
        currentValuesPE = result.values;
        updateValueDisplay(gridPE, currentValuesPE);
        peStatus.textContent = `Converged in ${result.iterations} steps`;
    }

    async function runValueIterationAnimated() {
        isAutoRunning = true;
        autoBtn.style.display = 'none';
        viBtn.style.display = 'none';
        stopBtn.style.display = 'block';

        let delta = 1.0;
        let count = 0;
        while (isAutoRunning && delta > 0.0001 && count < 500) {
            const data = { gridSize, end: endPoint.split('-').map(Number), obstacles: Array.from(obstacles).map(o => o.split('-').map(Number)), currentValues: currentValuesVI };
            const response = await fetch('/vi_step', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
            const result = await response.json();
            currentValuesVI = result.values;
            delta = result.delta;
            count++;
            updateValueDisplay(gridVI, currentValuesVI);
            viStatus.textContent = `Step: ${count} (Delta: ${delta.toFixed(5)})`;
            await new Promise(r => setTimeout(r, 60));
        }

        if (isAutoRunning) {
            const dataFinal = { gridSize, start: startPoint.split('-').map(Number), end: endPoint.split('-').map(Number), obstacles: Array.from(obstacles).map(o => o.split('-').map(Number)), values: currentValuesVI };
            const respFinal = await fetch('/get_best_results', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(dataFinal)
            });
            const resFinal = await respFinal.json();

            resFinal.path.forEach(([r, c]) => gridVI.querySelector(`.cell[data-row="${r}"][data-col="${c}"]`).classList.add('path-highlight'));
            resFinal.policy.forEach((row, r) => row.forEach((arrow, c) => {
                const cell = gridVI.querySelector(`.cell[data-row="${r}"][data-col="${c}"]`);
                const arrowEl = cell.querySelector('.policy-arrow');
                arrowEl.textContent = arrow;
                arrowEl.style.display = 'block';
            }));
            viStatus.textContent = "Optimal path found!";
        }
        stopAuto();
    }

    function stopAuto() {
        isAutoRunning = false;
        stopBtn.style.display = 'none';
        autoBtn.style.display = isEnvironmentLocked ? 'block' : 'none';
        viBtn.style.display = isEnvironmentLocked ? 'block' : 'none';
    }

    // === 5. Event Listeners ===
    gridSetup.addEventListener('click', (e) => {
        let t = e.target;
        while (t && !t.classList.contains('cell')) t = t.parentElement;
        if (!t) return;
        handleCellClick(parseInt(t.dataset.row), parseInt(t.dataset.col), `${t.dataset.row}-${t.dataset.col}`, t);
    });

    generateBtn.addEventListener('click', generateGrid);
    resetBtn.addEventListener('click', hardReset);
    confirmEnvBtn.addEventListener('click', lockEnvironment);
    genPolicyBtn.addEventListener('click', generateRandomPolicy);
    autoBtn.addEventListener('click', runPolicyEval);
    viBtn.addEventListener('click', runValueIterationAnimated);
    stopBtn.addEventListener('click', stopAuto);

    modeBtns.forEach(btn => btn.addEventListener('click', () => {
        modeBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        currentMode = btn.dataset.mode;
    }));

    hardReset();
});
