const boxes = Array.from(document.querySelectorAll(".box"));
const wrapper = document.querySelector(".wrapper");
let leftMargin = 60; //px
let boxesFlagArray = []; // flag for stacked panels
for(var i = 0; i < boxes.length; i++){
    boxesFlagArray.push({"isStacked": false});
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
function onHover() {
    const indexedElement = boxes.indexOf(this);
    const isPanelStacked = boxesFlagArray[indexedElement].isStacked;

    if (isPanelStacked) {
        for (i = indexedElement + 1; i < boxes.length; i++) {
            const iCoord = boxes[i].getBoundingClientRect();
            boxes[i].style.left = `${iCoord.left + 100}px`;
        }
    }
}

function onHoverLeave() {
    const indexedElement = boxes.indexOf(this);
    const isPanelStacked = boxesFlagArray[indexedElement].isStacked;

    if (isPanelStacked) {
        for (i = indexedElement + 1; i < boxes.length; i++) {
            const iCoord = boxes[i].getBoundingClientRect();
            boxes[i].style.left = `${iCoord.left - 100}px`;
        }
    }
}

wrapper.addEventListener("scroll", scrollWrap);
boxes.forEach((box, index) => box.addEventListener("mouseenter", onHover));
boxes.forEach((box, index) => box.addEventListener("mouseleave", onHoverLeave));