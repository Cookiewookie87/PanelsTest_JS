const boxes = Array.from(document.querySelectorAll(".box"));
const wrapper = document.querySelector(".wrapper");
const body = document.querySelector("body");
const box = document.querySelectorAll(".box");
let leftMargin = 60; //px
let hoverExtendFlag = false; // flag to update if on hover panels are extended
let boxesFlagArray = []; // flag for stacked panels
for(var i = 0; i < boxes.length; i++){
    boxesFlagArray.push({"isStacked": false, "isExpanded": false});
}

function scrollWrap(e) {
    let scrollCoord = wrapper.scrollLeft; // horizontal scroll value
    
    boxes.forEach((box, index) => {
        let leftMarginStop = (index) * leftMargin; // calculation for left margin stop (60, 120, 180,...)
        const boxCoord = box.getBoundingClientRect();
        const leftSideOfCurrent = boxCoord.left; // coordinarion of left side of panel
        const rightSideOfCurrent = boxCoord.right; // coordinarion of right side of panel
        const leftSideOfNextItem = (index < boxes.length - 1) ? box.nextElementSibling.getBoundingClientRect().left : 0; // coordinarion of left side of NEXT panel (when index is 8, the next sibling is 0 if it is less than 8 than it is next sibling)

        box.style.left = `${leftMarginStop}px`;

        // controll shadow of all 0+ elements
        if (leftSideOfCurrent <= leftMarginStop) {
            box.nextElementSibling.classList.add("shadow");
        }
        // controll removal of shadow of all 0+ elements
        if (leftSideOfNextItem === rightSideOfCurrent) {
            box.nextElementSibling.classList.remove("shadow");
        }
        // when panel 5 reach left margin, left margin change from 60 to 30 to all panels
        if (index > 4 && leftSideOfCurrent <= leftMarginStop) {
            leftMargin = 20;
        } else if (index < 6 && leftSideOfCurrent > leftMarginStop && !boxes[index].classList.contains('shadow')) {
            leftMargin = 60;
        }
        // setting flag (true/false) to stacked panels (reached leftMarginStop)
        if(leftMarginStop == leftSideOfCurrent && index > 0){
            if(!boxesFlagArray[index-1].isStacked){
                boxesFlagArray[index-1].isStacked = true;
            }
        }
        if(leftMarginStop != leftSideOfCurrent && index > 0){
             if(boxesFlagArray[index-1].isStacked){
                boxesFlagArray[index-1].isStacked = false;
            }
        }
  
    });
}

function onHover(event) { 
    const indexedElement = boxes.indexOf(this);
    const isPanelStacked = boxesFlagArray[indexedElement].isStacked;
    const fromBoxIndex = boxes.indexOf(event.fromElement);
    const toBoxIndex = boxes.indexOf(event.toElement);
    const boxCoordFrom = (fromBoxIndex >= 0) ? boxes[fromBoxIndex].getBoundingClientRect() : "";
    const boxCoordTo = boxes[toBoxIndex].getBoundingClientRect();

    // controll if we hover from body to box and if panel is stacked and it is not expanded yet
    if((event.fromElement == body || event.fromElement == wrapper) && event.toElement.classList.contains("box") && isPanelStacked && !hoverExtendFlag) {
        // when from body to box, extend all pannels from hover + 100px
        for (let i = indexedElement + 1; i < boxes.length; i++) {
            const iCoord = boxes[i].getBoundingClientRect();
            boxes[i].style.left = `${iCoord.left + 100}px`;
            boxesFlagArray[i].isExpanded = true;
        }
        hoverExtendFlag = true;
    }

    // controll if we hover from box to box and if panel is stacked
    if (event.fromElement.classList.contains("box") && event.toElement.classList.contains("box") && isPanelStacked) {
         if (!hoverExtendFlag) {
             for (let i = indexedElement + 1; i < boxes.length; i++) {
                const iCoord = boxes[i].getBoundingClientRect();
                boxes[i].style.left = `${iCoord.left + 100}px`;
                boxesFlagArray[i].isExpanded = true;
            }
             hoverExtendFlag = true;
         }
        // separate box hover controll
        if (fromBoxIndex > toBoxIndex && hoverExtendFlag) {
            event.fromElement.style.left = `${boxCoordFrom.left + 100}px`;
            boxesFlagArray[fromBoxIndex].isExpanded = true;
        } else if (fromBoxIndex < toBoxIndex && hoverExtendFlag) {
            event.toElement.style.left = `${boxCoordTo.left - 100}px`;
            boxesFlagArray[toBoxIndex].isExpanded = true;
        }
    }
}

function onHoverLeave(event) {
    const indexedElement = boxes.indexOf(this);
    const isPanelStacked = boxesFlagArray[indexedElement].isStacked;
    const fromBoxIndex = boxes.indexOf(event.fromElement);
    const toBoxIndex = boxes.indexOf(event.toElement);

    if((event.toElement == body || event.toElement == wrapper) && event.fromElement.classList.contains("box") && hoverExtendFlag) {
        // controll the mouse from box to body when left margin is narrow or extended
        if (leftMargin === 20) {
            for (let i = 0; i < boxes.length; i++) {
                boxes[i].style.left = `${20 * i}px`; // set all panels back to left margin multiply 20px
                boxesFlagArray[i].isExpanded = true;
            }
        } else if (leftMargin === 60) {
            for (let i = 0; i < boxes.length; i++) {
                boxes[i].style.left = `${60 * i}px`; // set all panels back to left margin multiply 60px
                boxesFlagArray[i].isExpanded = true;
            }
        }
        hoverExtendFlag = false;
    }
}

wrapper.addEventListener("scroll", scrollWrap);
boxes.forEach((box, index) => box.addEventListener("mouseenter", onHover));
boxes.forEach((box, index) => box.addEventListener("mouseleave", onHoverLeave));

/*
function onHover(event) {
    const indexedElement = boxes.indexOf(this);
    const isPanelStacked = boxesFlagArray[indexedElement].isStacked;
    const fromBoxIndex = boxes.indexOf(event.fromElement);
    const toBoxIndex = boxes.indexOf(event.toElement);

    if (isPanelStacked) {
        const boxCoordFrom = (fromBoxIndex >= 0) ? boxes[fromBoxIndex].getBoundingClientRect() : "";
        const boxCoordTo = boxes[toBoxIndex].getBoundingClientRect();

        if(event.fromElement == body || event.fromElement == wrapper && event.toElement.classList.contains("box")){  
                for (let i = indexedElement + 1; i < boxes.length; i++) {
                    const iCoord = boxes[i].getBoundingClientRect();
                    boxes[i].style.left = `${iCoord.left + 100}px`;
                    boxesFlagArray[i].isExpanded = true;
                }  
        } else if (fromBoxIndex > toBoxIndex) {
            console.log(fromBoxIndex);
            console.log(toBoxIndex);
            event.fromElement.style.left = `${boxCoordFrom.left + 100}px`;
            boxesFlagArray[fromBoxIndex].isExpanded = true;
        } else if (fromBoxIndex < toBoxIndex) {
            event.toElement.style.left = `${boxCoordTo.left - 100}px`;
            boxesFlagArray[toBoxIndex].isExpanded = true;
        }
    }
}

function onHoverLeave(event) {
    if(event.toElement == body || event.toElement == wrapper && event.fromElement.classList.contains("box")) {
        console.table(boxesFlagArray);
    }
    console.log(event.toElement);
    var body = document.querySelector("body"),
        wrapper = document.querySelector(".wrapper");
    const indexedElement = boxes.indexOf(this);
    const isPanelStacked = boxesFlagArray[indexedElement].isStacked;

    if (isPanelStacked) {
        if(event.toElement == body || event.fromElement == wrapper){
            if (isPanelStacked) {
                for (let i = indexedElement + 1; i < boxes.length; i++) {
                    const iCoord = boxes[i].getBoundingClientRect();
                    boxes[i].style.left = `${iCoord.left - 100}px`;
                }
            }
        } else {
    
        }
    } 
}
*/ 


