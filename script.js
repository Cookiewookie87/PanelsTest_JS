// TODO
// 1. when fast scroll, panels margin is broken
// 2. when scroll and panels get stacked below mouse, and when mouse moves, the panel move is broken
// 3. when panels are stacked, and if i click 4 panel, the mouse hover is broken (same prolem as 2.?)
// 4. on other computer in same chrome does not work like it should

const boxes = Array.from(document.querySelectorAll(".box"));
const wrapper = document.querySelector(".wrapper");
const body = document.querySelector("body");
const dash = document.querySelector(".dashboard");
const hoverMargin = 100; //px
let hoverExtendFlag = false; // flag to update if on hover panels are extended
let boxesFlagArray = []; // flag for stacked panels
for(var i = 0; i < boxes.length; i++){
    boxesFlagArray.push({"isStacked": false});
}

function scrollWrap() {
    //console.log(wrapper.scrollLeft);
    boxes.forEach((box, index) => {
        const boxCoord = box.getBoundingClientRect();
        const dashCoord = dash.getBoundingClientRect();
        const dashRight = dashCoord.right;
        const leftSideOfCurrent = boxCoord.left; // coordinarion of left side of panel
        const rightSideOfCurrent = boxCoord.right; // coordinarion of right side of panel
        const leftSideOfNextItem = (index < boxes.length - 1) ? box.nextElementSibling.getBoundingClientRect().left : 0; // coordinarion of left side of NEXT panel (when index is 8, the next sibling is 0 if it is less than 8 than it is next sibling)
        const leftValue = parseInt(window.getComputedStyle(box, null).getPropertyValue("left")); // gets the left value of CSS without "px"
        let multiplyShrinkMargin = 4; // when panels shrink we want first element to start stacking 20 * 4px (4 because we start at 4 panel)
        
        // change dashboard
        if (index === 0 && leftSideOfCurrent === leftValue) {
            //dash.style.backgroundImage = "url(img/0.1.png)";
            //dash.style.backgroundRepeat = "no-repeat";
            dash.style.backgroundColor = "#ccc";
        }
        if (index === 0 && leftSideOfNextItem === rightSideOfCurrent) { 
            //dash.style.backgroundImage = "url(img/0.0.png)";
            //dash.style.backgroundRepeat = "no-repeat";
            dash.style.backgroundColor = "#1a1a1a";
        }

        // shadow controll
        if (index < boxes.length-1) { // do not apply shadow to last element
            // controll shadow of first panel
            if (leftSideOfCurrent < dashRight && index === 0) { 
                box.classList.add("shadow");
            }
            if (leftSideOfCurrent === dashRight && index === 0) { 
                box.classList.remove("shadow");
            }
            // controll shadow of all 1+ elements
            if (leftSideOfCurrent <= leftValue) {
                box.nextElementSibling.classList.add("shadow");
            }
            // controll removal of shadow of all 1+ elements
            if (leftSideOfNextItem === rightSideOfCurrent) {
                box.nextElementSibling.classList.remove("shadow");
            }
        }

        // stacking controll
        if (index > 3 && leftSideOfCurrent <= leftValue) { 
            boxes.forEach((box, index) => {
                if (index > 0) {
                    let shrinkMargin = 20;
                    shrinkMargin *= multiplyShrinkMargin;
                    box.style.left = shrinkMargin + "px";
                    multiplyShrinkMargin++;   
                }
            });
        } else if (index < 5 && leftSideOfCurrent > leftValue && !boxes[index].classList.contains("shadow")) { 
            boxes.forEach((box, index) => {
                if (index > -1) {
                    let growMargin = 60;
                    growMargin *= index + 1;
                    box.style.left = growMargin + "px";
                }
            });
        }

        // setting flag (true/false) to stacked panels (reached leftValue)
        if(leftValue == leftSideOfCurrent && index > 0){
            if(!boxesFlagArray[index].isStacked){
                boxesFlagArray[index-1].isStacked = true;
            }
        }
        if(leftValue != leftSideOfCurrent && index > 0){
            if(boxesFlagArray[index-1].isStacked) {
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

    if (event.fromElement == null) return; // fix error: Cannot read property 'classList' of null

    // controll if we hover from body to box and if panel is stacked and it is not expanded yet
    if((event.fromElement == body || event.fromElement == wrapper) && event.toElement.classList.contains("box") && isPanelStacked) {
        slidingPanelsOpen(indexedElement);
    }
    
    // controll if we hover from box to box and if panel is stacked
    if (event.fromElement.classList.contains("box") && event.toElement.classList.contains("box") && isPanelStacked) {
        if (!hoverExtendFlag) {
            slidingPanelsOpen(indexedElement);
            hoverExtendFlag = true;
        }
    }

    // controll mouse from dashboard to box
    if (event.toElement.classList.contains("box") && event.fromElement === dash && isPanelStacked) { 
        slidingPanelsOpen(indexedElement);
        hoverExtendFlag = true;
    }

    // From box to box hover controll
    if (fromBoxIndex > toBoxIndex && hoverExtendFlag) {
        event.fromElement.style.left = `${boxCoordFrom.left + hoverMargin}px`;
    } else if ((fromBoxIndex < toBoxIndex && fromBoxIndex > -1) && hoverExtendFlag) {
        event.toElement.style.left = `${boxCoordTo.left - hoverMargin}px`;
    }
}

function onHoverLeave(event) {
    const indexedElement = boxes.indexOf(this);
    const isPanelStacked = boxesFlagArray[indexedElement].isStacked;
    const toBoxIndex = boxes.indexOf(event.toElement);
    
    if (event.toElement == null) return; // fix error: Cannot read property 'classList' of null

    // controll the mouse from box to body when left margin is narrow or extended
    if((event.toElement == body || event.toElement == wrapper) && event.fromElement.classList.contains("box")) {
        slidingPanelsClose(indexedElement);
        hoverExtendFlag = false;
    }

    // controll from box to box hover out, to return to initial state
    if (event.fromElement.classList.contains("box") && event.toElement.classList.contains("box") && (isPanelStacked === false || (isPanelStacked === true && boxesFlagArray[toBoxIndex].isStacked === false ))) { // checks if the from is true and to is false (first false element)
        slidingPanelsClose(indexedElement);
        hoverExtendFlag = false;
    }
}

function dashMouseEnter(event) { 
    if (event.fromElement == null) return; // fix error: Cannot read property 'classList' of null

    // controll hover on dashboard from box
    if (event.fromElement.classList.contains("box") && event.toElement === dash) { 
        for (let i = 1; i < boxes.length; i++) {
            const iCoord = boxes[i].getBoundingClientRect();
            boxes[i].style.left = `${iCoord.left - hoverMargin}px`;
        }
        hoverExtendFlag = false;
    }
}

function panelClick() {
    const indexedElement = boxes.indexOf(this);
    const isPanelStacked = boxesFlagArray[indexedElement].isStacked;
    //TODO: this must be done in more dynamic way
    // When clicked to element scroll to position
    if (isPanelStacked) {
        switch (indexedElement) {
        case 0:
            scrollPanel(298);
            break;
        case 1:
            scrollPanel(607);
            break;
        case 2:
            scrollPanel(1059);
            break;
        case 3:
            scrollPanel(1971);
            break;
        case 4:
            scrollPanel(2584);
            break;
        case 5:
            scrollPanel(3076);
            break;
        default:
            break;
        }
    }
}

// function to slide panels to open (+)
function slidingPanelsOpen(indexedElement) { 
    // TODO hover still fires when panel is clicked
    for (let i = indexedElement + 1; i < boxes.length; i++) {
        const iCoord = boxes[i].getBoundingClientRect();
        boxes[i].style.left = `${iCoord.left + hoverMargin}px`;
    }
}
// function to slide panels to close (-)
function slidingPanelsClose(indexedElement) {
    for (let i = indexedElement + 1; i < boxes.length; i++) {
        const iCoord = boxes[i].getBoundingClientRect();
        boxes[i].style.left = `${iCoord.left - hoverMargin}px`;
    }
}
// function to set scroll position
function scrollPanel(scrollTo) { 
    wrapper.scroll({
        left: scrollTo,
        behavior: "smooth"
    });
}

wrapper.addEventListener("scroll", scrollWrap);
boxes.forEach(box => box.addEventListener("mouseenter", onHover));
boxes.forEach(box => box.addEventListener("mouseleave", onHoverLeave));
dash.addEventListener("mouseenter", dashMouseEnter);
boxes.forEach(box => box.addEventListener("click", panelClick));