// Initialize elements
const cells = Array.from(document.querySelectorAll("section div"));
const section = document.querySelector("section");
const bins = Array.from(document.querySelectorAll(".footer-container div:not([class*='b'])"));
const percentageBars = {
    b30: document.querySelector(".b30"),
    b11: document.querySelector(".b11"),
    b9: document.querySelector(".b9"),
    b27: document.querySelector(".b27"),
    b18: document.querySelector(".b18")
};

// Initialize bin values and capacities
const binValues = {
    '01': { current: 0, capacity: 30, element: percentageBars.b30 },
    '02': { current: 0, capacity: 11, element: percentageBars.b11 },
    '03': { current: 0, capacity: 9, element: percentageBars.b9 },
    '04': { current: 0, capacity: 27, element: percentageBars.b27 },
    '05': { current: 0, capacity: 18, element: percentageBars.b18 }
};

// Set random numbers into each cell and make them draggable
cells.forEach((cell, index) => {
    cell.textContent = Math.floor(Math.random() * 10);
    cell.draggable = true;
    
    // Add floating animation classes
    const animationTypes = ['float-up-down', 'float-left-right', 'float-diagonal-1', 'float-diagonal-2'];
    const randomAnimation = animationTypes[Math.floor(Math.random() * animationTypes.length)];
    
    // Add random delay and duration to make the movement more organic
    const randomDelay = Math.random() * 5; // 0-5s delay
    const randomDuration = 3 + Math.random() * 7; // 3-10s duration
    
    cell.classList.add(randomAnimation);
    cell.style.animationDelay = `${randomDelay}s`;
    cell.style.animationDuration = `${randomDuration}s`;
});

// Drag and Drop functionality
let draggedCell = null;

// Drag Start
document.addEventListener("dragstart", function(e) {
    if (e.target.matches("section div")) {
        draggedCell = e.target;
        e.target.style.opacity = "0.5";
    }
});

// Drag End
document.addEventListener("dragend", function(e) {
    if (e.target.matches("section div")) {
        e.target.style.opacity = "1";
    }
});

// Bin Hover Effects
bins.forEach(bin => {
    bin.addEventListener("dragover", function(e) {
        e.preventDefault();
        this.style.backgroundColor = "#137a8c";
        this.style.color = "#08203A";
    });
    
    bin.addEventListener("dragleave", function() {
        this.style.backgroundColor = "#08203A";
        this.style.color = "#8EE3F1";
    });
    
    bin.addEventListener("drop", function(e) {
        e.preventDefault();
        this.style.backgroundColor = "#08203A";
        this.style.color = "#8EE3F1";
        
        if (draggedCell) {
            const binNumber = this.textContent;
            const numberValue = parseInt(draggedCell.textContent);
            
            // Update the bin value
            binValues[binNumber].current += numberValue;
            
            // Cap at 100%
            if (binValues[binNumber].current > binValues[binNumber].capacity) {
                binValues[binNumber].current = binValues[binNumber].capacity;
                binValues[binNumber].element.classList.add("bin-full");
                setTimeout(() => {
                    binValues[binNumber].element.classList.remove("bin-full");
                }, 1000);
            }
            
            // Update the percentage bar
            updatePercentageBar(binNumber);
            
            // Generate new random number for the grid cell
            draggedCell.textContent = Math.floor(Math.random() * 10);
            
            // Add visual feedback
            this.classList.add("bin-pulse");
            setTimeout(() => {
                this.classList.remove("bin-pulse");
            }, 500);
        }
    });
});

function updatePercentageBar(binNumber) {
    const binData = binValues[binNumber];
    const percentage = (binData.current / binData.capacity) * 100;
    
    // Update the width of the percentage bar
    binData.element.style.setProperty('--percentage', `${percentage}%`);
    
    // Update the text to show current/capacity
    binData.element.querySelector('span').textContent = `${Math.round(percentage)}%`;
    
    // Update the overall completion percentage
    updateOverallCompletion();
}

function updateOverallCompletion() {
    const headerPercent = document.querySelector('.header-percent');
    let totalPercentage = 0;
    let totalCapacity = 0;
    let totalCurrent = 0;
    
    // Calculate totals across all bins
    Object.keys(binValues).forEach(binNumber => {
        totalCapacity += binValues[binNumber].capacity;
        totalCurrent += binValues[binNumber].current;
    });
    
    // Calculate overall percentage (capped at 100)
    const overallPercentage = Math.min((totalCurrent / totalCapacity) * 100, 100);
    
    // Update the header display
    headerPercent.textContent = `${Math.round(overallPercentage)}% Complete`;
    
    // Visual feedback when reaching 100%
    if (overallPercentage >= 100) {
        document.querySelector('header').classList.add('completed');
        setTimeout(() => {
            document.querySelector('header').classList.remove('completed');
        }, 2000);
    }
}

// Hover animation functions
let hoverActive = false;

function getRandomAnimationClass() {
    const animations = ['hover-active-1', 'hover-active-2', 'hover-active-3'];
    return animations[Math.floor(Math.random() * animations.length)];
}

function handleCellHover(e) {
    const hoveredCell = e.target;
    const index = cells.indexOf(hoveredCell);
    const gridColumns = getComputedStyle(section).gridTemplateColumns.split(" ").length;

    // Reset all cells hover effects (but keep the floating animations)
    cells.forEach(cell => {
        cell.classList.remove('hover-center', 'hover-active', 'hover-active-1', 'hover-active-2', 'hover-active-3');
    });

    // Mark the center cell
    hoveredCell.classList.add('hover-center', getRandomAnimationClass());

    // Process the 8 surrounding cells
    for (let rowOffset = -1; rowOffset <= 1; rowOffset++) {
        for (let colOffset = -1; colOffset <= 1; colOffset++) {
            if (rowOffset === 0 && colOffset === 0) continue;

            const rowIndex = Math.floor(index / gridColumns) + rowOffset;
            const colIndex = (index % gridColumns) + colOffset;
            
            if (rowIndex >= 0 && colIndex >= 0) {
                const neighborIndex = rowIndex * gridColumns + colIndex;
                if (neighborIndex >= 0 && neighborIndex < cells.length) {
                    cells[neighborIndex].classList.add('hover-active', getRandomAnimationClass());
                }
            }
        }
    }
}

// Initialize event listeners
section.addEventListener('mouseenter', () => hoverActive = true);
section.addEventListener('mouseleave', () => {
    hoverActive = false;
    cells.forEach(cell => {
        cell.classList.remove('hover-center', 'hover-active', 'hover-active-1', 'hover-active-2', 'hover-active-3');
    });
});

cells.forEach(cell => {
    cell.addEventListener('mouseenter', handleCellHover);
    cell.addEventListener('mouseleave', () => {
        if (!hoverActive) {
            cells.forEach(c => {
                c.classList.remove('hover-center', 'hover-active', 'hover-active-1', 'hover-active-2', 'hover-active-3');
            });
        }
    });
});

// Initialize percentage bars
Object.keys(binValues).forEach(binNumber => {
    updatePercentageBar(binNumber);
});