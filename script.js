const boxes = Array.from(document.querySelectorAll(".box"));
const wrapper = document.querySelector(".wrapper");
const body = document.querySelector("body");
const dash = document.querySelector(".dashboard");
const hoverMargin = 100; //px
let shrinkFlag = false;
let hoverExtendFlag = false; // flag to update if on hover panels are extended
let boxesFlagArray = []; // flag for stacked panels
for(var i = 0; i < boxes.length; i++){
    boxesFlagArray.push({"isStacked": false});
}

function scrollWrap() {
    boxes.forEach((box, index) => {
        const boxCoord = box.getBoundingClientRect();
        const dashCoord = dash.getBoundingClientRect();
        const dashRight = dashCoord.right;
        const leftSideOfCurrent = boxCoord.left; // coordinarion of left side of panel
        const rightSideOfCurrent = boxCoord.right; // coordinarion of right side of panel
        const leftSideOfNextItem = (index < boxes.length - 1) ? box.nextElementSibling.getBoundingClientRect().left : 0; // coordinarion of left side of NEXT panel (when index is 8, the next sibling is 0 if it is less than 8 than it is next sibling)
        const leftValue = parseInt(window.getComputedStyle(box, null).getPropertyValue("left")); // gets the left value of CSS without "px"
        let multiplyShrinkMargin = 4; // when panels shrink we want first element to start stacking 20 * 4px
        
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
                    shrinkFlag = true;
                }
            });
        } else if (index < 5 && leftSideOfCurrent > leftValue && !boxes[index].classList.contains("shadow")) { 
            boxes.forEach((box, index) => {
                if (index > -1) {
                    let growMargin = 60;
                    growMargin *= index + 1;
                    box.style.left = growMargin + "px";
                    shrinkFlag = false;
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
        for (let i = indexedElement + 1; i < boxes.length; i++) {
            const iCoord = boxes[i].getBoundingClientRect();
            boxes[i].style.left = `${iCoord.left + hoverMargin}px`;
        }
    }

    // controll if we hover from box to box and if panel is stacked
    if (event.fromElement.classList.contains("box") && event.toElement.classList.contains("box") && isPanelStacked) {
        if (!hoverExtendFlag) {
            for (let i = indexedElement + 1; i < boxes.length; i++) {
                const iCoord = boxes[i].getBoundingClientRect();
                boxes[i].style.left = `${iCoord.left + hoverMargin}px`;
            }
            hoverExtendFlag = true;
        }
    }

    // From box to box hover controll, move panels
    if (fromBoxIndex > toBoxIndex && hoverExtendFlag) {
        event.fromElement.style.left = `${boxCoordFrom.left + hoverMargin}px`;
    } else if (fromBoxIndex < toBoxIndex && hoverExtendFlag) {
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
        for (let i = indexedElement + 1; i < boxes.length; i++) {
            const iCoord = boxes[i].getBoundingClientRect();
            boxes[i].style.left = `${iCoord.left - hoverMargin}px`;
        }
        hoverExtendFlag = false;
    }

    // controll from box to box hover out, to return to initial state
    if (event.fromElement.classList.contains("box") && event.toElement.classList.contains("box") && (isPanelStacked === false || (isPanelStacked === true && boxesFlagArray[toBoxIndex].isStacked === false )) ) { // checks if the from is true and to is false (first false element)
        for (let i = indexedElement+1; i < boxes.length; i++) {
            const iCoord = boxes[i].getBoundingClientRect();
            boxes[i].style.left = `${iCoord.left - hoverMargin}px`;
        }
        hoverExtendFlag = false;
    }
}
/*
function dashMouseEnter(event) { 
    const indexedElement = boxes.indexOf(this);

    // controll the mouse from box to body when left margin is narrow or extended
    if (hoverExtendFlag) {
        for (let i = 1; i < boxes.length; i++) {
            const iCoord = boxes[i].getBoundingClientRect();
            boxes[i].style.left = `${iCoord.left - hoverMargin}px`;
        }
        hoverExtendFlag = false;
    }  
}
*/
wrapper.addEventListener("scroll", scrollWrap);
boxes.forEach(box => box.addEventListener("mouseenter", onHover));
boxes.forEach(box => box.addEventListener("mouseleave", onHoverLeave));
//dash.addEventListener("mouseenter", dashMouseEnter);