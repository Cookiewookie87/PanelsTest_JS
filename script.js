// TODO
// 1. when fast scroll, panels margin is broken
// 2. when scroll and panels get stacked below mouse, and when mouse moves, the panel move is broken
// 3. when panels are stacked, and if i click 4 panel, the mouse hover is broken (same prolem as 2.?)
// 4. on other computer in same chrome does not work like it should
// 5. check slidingPanelsOpen() and onHover() (the last if), this is causing panels to break.
//    I have to slowly think to remove from body to box and vice versa.
// 6. Seems like hover event breaks stacking panels when scrolling. Have to do flag or workaround to disable hover when scrolling is active

const boxes = Array.from(document.querySelectorAll(".box"));
const wrapper = document.querySelector(".wrapper");
const dash = document.querySelector(".dashboard");
const body = document.querySelector("body");
const smallMargin = 20; // px
const bigMargin = 60; // px
const hoverMargin = 100; //px
let isHover = false; // flag to update if on hover panels are extended
let isScrolling; // flaf when user is scrolling
let boxesFlagArray = []; // flag for stacked panels
let supressEvents = false;

for(var i = 0; i < boxes.length; i++){
    boxesFlagArray.push({"isStacked": false});
    let box = boxes[i];
    box.addEventListener("click", panelClick);
    box.addEventListener("mouseenter", onHover);
    box.addEventListener("mouseleave", hoverLeave);
}
dash.addEventListener("mouseenter", dashMouseEnter);


window.addEventListener("load", function(){
    setBigMargin(bigMargin);
});

// function to slide panels to open (+)
function slidingPanelsOpen(indexedElement) {
    if (!isHover) { 
        for (let i = indexedElement + 1; i < boxes.length; i++) {
            const iCoord = boxes[i].getBoundingClientRect();
            boxes[i].style.left = `${iCoord.left + hoverMargin}px`;
        }
    }
}

// function to slide panels to close (-)
function slidingPanelsClose(indexedElement) {
    if (isHover) { 
        for (let i = indexedElement + 1; i < boxes.length; i++) {
            const iCoord = boxes[i].getBoundingClientRect();
            boxes[i].style.left = `${iCoord.left - hoverMargin}px`;
        }
    }
}

// function to set big margin on scroll panels
function setBigMargin(bigMargin) { 
    let multiply = 1;
    boxes.forEach(box => {
        box.style.left = `${bigMargin * multiply}px`;
        multiply++;
    });
}
// function to set small margin on scroll panels
function setSmallMargin(smallMargin) { 
    let multiply = 4; // dashboard is 60px width, next margin is 80px. 4*20 = 80
    boxes.forEach((box, index) => {
        if (index === 0) { 
            box.style.left = `${bigMargin}px`; // first panel is allways 60px margin
        } else if (index > 0) { 
            box.style.left = `${smallMargin * multiply}px`; // all 1+ panel margin
            multiply++;
        }
    });
}

// function to set scroll position
function scrollPanel(scrollTo) { 
    wrapper.scroll({
        left: scrollTo,
        behavior: "smooth"
    });
}

function scrolling() {
    window.clearTimeout(isScrolling); // Clear our timeout throughout the scroll
    //isHover = false;
    // when user is NOT scrolling:
    supressEvents = true;
    for (let i = 0; i < boxes.length; i++) {
        boxes[i].style.pointerEvents = "none";  // for disabling cursor hover or actions when scrolling
    }

    isScrolling = setTimeout(function () {
        console.log("Scrolling has stopped.");
        for (let i = 0; i < boxes.length; i++) {
            boxes[i].style.pointerEvents = "auto";  // for enabling cursor hover or actions
        }
        supressEvents = false;

    }, 200);
    // console.log(wrapper.scrollLeft);

    // when user IS scrolling
    boxes.forEach((box, index) => {
        const boxCoord = box.getBoundingClientRect();
        const dashCoord = dash.getBoundingClientRect();
        const dashRight = dashCoord.right;
        const leftSideOfCurrent = boxCoord.left; // coordinarion of left side of panel
        const rightSideOfCurrent = boxCoord.right; // coordinarion of right side of panel
        const leftSideOfNextItem = box.nextElementSibling.getBoundingClientRect().left;
        const leftValue = parseInt(window.getComputedStyle(box, null).getPropertyValue("left")); // gets the left value of CSS without "px"
        
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
            setSmallMargin(smallMargin);
        } else if (index < 5 && leftSideOfCurrent > leftValue && !boxes[index].classList.contains("shadow")) { 
            setBigMargin(bigMargin);
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
        if (wrapper.scrollLeft > 3570) { // fix when fast scroll to set panels stack to true
            for(var i = 0; i < boxes.length - 1; i++){
                boxesFlagArray[i].isStacked = true;
            }
        }

    });
}

function onHover(event) { 
    if (supressEvents) return;
    const indexedElement = boxes.indexOf(this);
    const isPanelStacked = boxesFlagArray[indexedElement].isStacked;
    const fromBoxIndex = boxes.indexOf(event.fromElement);
    const toBoxIndex = boxes.indexOf(event.toElement);
    const boxCoordFrom = (fromBoxIndex >= 0) ? boxes[fromBoxIndex].getBoundingClientRect() : "";
    const boxCoordTo = boxes[toBoxIndex].getBoundingClientRect();
    
    if (event.fromElement == null) return; // fix error: Cannot read property 'classList' of null

    // controll if we hover from box to box and if panel is stacked
    if (event.fromElement.classList.contains("box") && event.toElement.classList.contains("box") && isPanelStacked) {
        if (!isHover) {
            slidingPanelsOpen(indexedElement);
            isHover = true;
        }
    }

    // controll if we hover from body to box and if panel is stacked and it is not expanded yet
    if((event.fromElement == body || event.fromElement == wrapper) && event.toElement.classList.contains("box") && isPanelStacked) {
        slidingPanelsOpen(indexedElement);
        isHover = true;
    }

    // From box to box hover controll
    if (fromBoxIndex > toBoxIndex && isHover) {
        event.fromElement.style.left = `${boxCoordFrom.left + hoverMargin}px`;
    } else if ((fromBoxIndex < toBoxIndex && fromBoxIndex > -1) && isHover) {
        event.toElement.style.left = `${boxCoordTo.left - hoverMargin}px`;
    }

    // controll mouse from dashboard to box
    if (event.toElement.classList.contains("box") && event.fromElement === dash && isPanelStacked) { 
        slidingPanelsOpen(indexedElement);
        isHover = true;
    }
}

function hoverLeave() { 
    if (supressEvents) return;
    const indexedElement = boxes.indexOf(this);
    const isPanelStacked = boxesFlagArray[indexedElement].isStacked;
    const toBoxIndex = boxes.indexOf(event.toElement);

    if (event.toElement == null) return; // fix error: Cannot read property 'classList' of null
    
    // controll the mouse from box to body when left margin is narrow or extended
    if((event.toElement == body || event.toElement == wrapper) && event.fromElement.classList.contains("box")) {
        slidingPanelsClose(indexedElement);
        isHover = false;
    }

    // controll from box to box hover out, to return to initial state
    if (event.fromElement.classList.contains("box") && event.toElement.classList.contains("box") && (isPanelStacked === false || (isPanelStacked === true && boxesFlagArray[toBoxIndex].isStacked === false ))) { // checks if the from is true and to is false (first false element)
        slidingPanelsClose(indexedElement);
        isHover = false;
    }
}

function dashMouseEnter(event) { 
    if (supressEvents) return;
    if (event.fromElement == null) return; // fix error: Cannot read property 'classList' of null

    // controll hover on dashboard from box
    if (event.fromElement.classList.contains("box") && event.toElement === dash) { 
        for (let i = 1; i < boxes.length; i++) {
            const iCoord = boxes[i].getBoundingClientRect();
            boxes[i].style.left = `${iCoord.left - hoverMargin}px`;
        }
        isHover = false;
    }
}

function panelClick() {
    if (supressEvents) return;
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
        isHover = false;
    }
}

wrapper.addEventListener("scroll", scrolling);
