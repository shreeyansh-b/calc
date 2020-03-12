var mainCalculation = (function(){
    let nums = [null,null];
    let equals = 0, selection = 0, decimal = 0, tens = 1, result = null, negative = 1;
    let operator = null;
    return{
        calNum: function(num){
            if(decimal === 0){
                num = negative*parseInt(num);
                nums[selection] = num + nums[selection]*10;
                return(nums[selection]);
            }else{
                num = negative*parseInt(num); 
                nums[selection] = parseFloat((num/(Math.pow(10, tens))).toFixed(tens)) + nums[selection];   //else there will be the 0.000004 bug. if not for toFixed
                nums[selection] = parseFloat(parseFloat(nums[selection]).toFixed(tens));    //2 parseFloat cause toFixed returns a string
                tens = tens + 1;
                return(nums[selection]);
            }

        },
        doDiv: function(){
            result = nums[0]/nums[1];
            return result;
        },
        doMul: function(){
            result = nums[0]*nums[1];
            return result;
        },
        doAdd: function(){
            //bug when adding multiple numbers with decimal part
            //shows .0000001 or something similar at the end


            var countDecimals = function (value) {
                if(Math.floor(value) === value) return 0;   //if there's no decimal part
                return value.toString().split(".")[1].length || 0;  //it'll get regardless of upper if statement. if there's a decimal part return its lenght or ( || ) else return 0
            }


            const size0 = countDecimals(nums[0]);
            const size1 = countDecimals(nums[1]);
            let places;
            if(size0 > size1){
                places = size0;
            }else{
                places = size1;
            }
            result = nums[0]+nums[1];
            result = parseFloat(result.toFixed(places));
            return result;
        },
        doSub: function(){
            result = nums[0]-nums[1];
            return result;
        },
        setDecimal: function(){
            decimal = 1;
        },
        resetDecimal: function(){
            decimal = 0;
        },
        setSelection: function(){
            selection = 1;
        },
        setOperator: function(op){
            operator = op;
        },
        setNum: function(){
            nums[0] = result;
        },
        setEquals: function(){
            equals = 1;
        },
        setNegative: function(){
            negative = -1;
        },
        resetNegative: function(){
            negative = 1;
        },
        resetSelection: function(){
            selection = 0
        },
        resetTens: function(){
            tens = 1;
        },
        resetNums: function(){
            nums = [null, null];
        },
        resetOperator: function(){
            operator = null;
        },
        resetEquals: function(){
            equals = 0;
        },
        returnSelection: function(){
            return selection;
        },
        returnDecimal: function(){
            return decimal;
        },
        returnOperator: function(){
            return operator;
        },
        returnResult: function(){
            return result;
        },
        returnNums: function(){
            return nums;
        },
        returnEquals: function(){
            return equals;
        }

    }

})();
var UIController = (function(){
    return{
        putNum: function(num){
            const sel = mainCalculation.returnSelection();
            let html = document.querySelector(`.num${sel}`);
            html.textContent = num;
        },
        putSym: function(sym){
            let html = document.querySelector(".symbol");
            html.textContent = sym; 
        },
        pushEqu: function(result){
            let equ = document.querySelector(".result");
            let res = document.querySelector(".num0");
            let des = document.querySelector(".equation");
            des.textContent = equ.textContent;
            res.textContent = result;
            document.querySelector(".num1").textContent = "";
            document.querySelector(".symbol").textContent = "";
        },
        clearUI: function(){
            document.querySelector(".num0").textContent = "0";
            document.querySelector(".num1").textContent = "";
            document.querySelector(".symbol").textContent = "";
            document.querySelector(".equation").textContent = "";
        }
    }
})();
var controller = (function(mainCalc, UICtrl){

    setupEventListeners = function() {

        let re_num = /[0-9]/;
        let re_sym = /[\+\-\*\/]/;
        let num;

        document.querySelector(".bottom").addEventListener('click', (e) => {
            //Using event delegation else works for only first button as there are multiple classes with same name

            if(e.target.className === "btn" || e.target.className === "btn btn--symbol"){
                // console.log(e.target.value);
                if(!re_num.test(e.target.value)){   //checks whether a number or not. proceeds if not NaN
                    //decimal operator
                    if(e.target.value === "." && mainCalc.returnEquals() === 0){     //if input is decimal
                        if(mainCalc.returnDecimal() === 0){
                            mainCalc.setDecimal();
                        }else{
                            console.log("decimal operator error");
                        }
                        
                    }else if(re_sym.test(e.target.value) && mainCalc.returnNums()[0] !== null && mainCalc.returnNums()[1] == null ){  //if input is / * + - 
                        console.log("here");
                        mainCalc.setSelection();    //sets nums[1]
                        mainCalc.resetDecimal();    //resets decimal
                        mainCalc.resetTens();   //else the decimal part of second number gets divided by last tens value
                        mainCalc.resetNegative();   //resets negative number
                        mainCalc.setOperator(e.target.value);   //sets operator /*-+
                        mainCalc.resetEquals(); // if user wishes to continue with result of last operation
                        UICtrl.putSym(e.target.value);
                    }else if(e.target.value === "-" && mainCalc.returnNums()[0] === null){
                        mainCalc.setNegative();
                    }else if(re_sym.test(e.target.value) && mainCalc.returnOperator !== null && mainCalc.returnNums()[0] !== null && mainCalc.returnNums()[1] !== null){
                        equals();
                        mainCalc.setOperator(e.target.value);   //setting the operator as equals resets it
                        UICtrl.putSym(e.target.value);
                        mainCalc.resetEquals(); //resetting  equals cause user presses operator that means they will continue with the result

                    }
                }else{
                    if(mainCalc.returnEquals() === 0){   //else if continuing with result of last
                       
                        num =  mainCalc.calNum(e.target.value);
                        //console.log(num);
                        UICtrl.putNum(num);
                    }else{          //if it's a fresh/first input  //it'll only be reset if user press symbols or enter a number directly after result
                        mainCalc.resetNums();   //resets nums
                        //console.log("if equals followed by a number");
                        num =  mainCalc.calNum(e.target.value);
                        mainCalc.resetEquals(); //resets equals so that in next input it goes to former if. Otherwise it would resetnums again and again
                        //console.log(num);
                        UICtrl.putNum(num);
                    }

                }
            }else if(e.target.className === "btn btn--equ"){
                //do equal
                // console.log('equals');
                /*
                do calc
                display result
                if next input is symbol then result is nums[0]
                else if it's a number then input is nums[0]
                */

                /*
                set result 
                check if result is null or not
                if not and is a number then reset nums and proceed
                if not and is a symbol then result is num[0]
                */
                if(mainCalc.returnSelection() === 0){   //if someone presses = without entering second number
                    //display nums[0]
                }else{
                    let result;
                    if(mainCalc.returnOperator() === '/'){
                        result = mainCalc.doDiv();
                        
                    }else if(mainCalc.returnOperator() === '*'){
                        result = mainCalc.doMul();

                    }else if(mainCalc.returnOperator() === '+'){
                        result = mainCalc.doAdd();

                    }else{
                        result = mainCalc.doSub();

                    }
                    console.log(result);
                    //UI result
                    UICtrl.pushEqu(result);
                    //resetting stuff
                    mainCalc.resetSelection();
                    mainCalc.resetOperator();
                    mainCalc.resetNums();
                    mainCalc.setNum();
                    mainCalc.setEquals();

                }
            }else if(e.target.className === "btn btn--c"){
                //clear fields
                console.log('clear');
                //mainCalc clear

                
                mainCalc.resetNums();
                mainCalc.resetOperator();
                mainCalc.resetSelection();
                mainCalc.resetDecimal();
                mainCalc.resetTens();
                mainCalc.resetEquals();
                mainCalc.resetNegative();

                //UI clear
                UICtrl.clearUI();
            }
        });

        function equals () {
            let result;
                    if(mainCalc.returnOperator() === '/'){
                        result = mainCalc.doDiv();
                        
                    }else if(mainCalc.returnOperator() === '*'){
                        result = mainCalc.doMul();

                    }else if(mainCalc.returnOperator() === '+'){
                        result = mainCalc.doAdd();

                    }else{
                        result = mainCalc.doSub();

                    }
                    console.log(result);
                    //UI result
                    UICtrl.pushEqu(result);
                    //resetting stuff
                    mainCalc.setSelection();
                    mainCalc.resetOperator();
                    mainCalc.resetNums();
                    mainCalc.setNum();
                    mainCalc.setEquals();
                    mainCalc.resetDecimal();   
                    mainCalc.resetTens();  
        }


    };

    return{
        init: function(){
            setupEventListeners();
        }
        
    }
})(mainCalculation, UIController);
controller.init();