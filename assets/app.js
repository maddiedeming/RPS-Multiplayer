//Global Variables
var players = 0;
var player;
var playerOne = "";
var playerTwo = "";
var playerOneSelect = "";
var playerTwoSelect = "";
var gameNumber = 1;
var gameNumber1;
var gameNumber2;
var popup = "";
var chatPlayer; 
$("#userText").hide();
$("#waiting").hide();
// Initialize Firebase
var config = {
    apiKey: "AIzaSyC6OHdldpl0FQFthlP4CsGg2nopeq0VxuE",
    authDomain: "rps-multiplayer-23462.firebaseapp.com",
    databaseURL: "https://rps-multiplayer-23462.firebaseio.com",
    projectId: "rps-multiplayer-23462",
    storageBucket: "rps-multiplayer-23462.appspot.com",
    messagingSenderId: "1085391550802"
};
firebase.initializeApp(config);
var database = firebase.database();
firebase.auth().signInAnonymously().catch(function(error){
    var errorCode = error.code;
    var errorMessage = error.message;
});
var uid = "";
var chatRef = firebase.database().ref('messages/');
var ref = firebase.database().ref('playersOnline/');
firebase.auth().onAuthStateChanged(function(user){
    if(user){
        var isAnonymous = user.isAnonymous;
        uid = user.uid;
        ref = firebase.database().ref('playersOnline/' + uid + '/');
        ref.set({
            gameDetails: {
                playerNumber: 0,
                selection: "",
                game: gameNumber
            }
        });
        chatRef.set({});                  
        ref.onDisconnect().remove();
        //chatRef.onDisconnect().remove();
    } 
    else{
        // error
    }
});
//
database.ref().orderByKey().on("child_added", function(snapshot){
    if(snapshot.key === "messages"){
        $("#chatMessages").empty();
        snapshot.forEach(function(child){
            var sender = child.val().sender;
            var textValue = child.val().text;
            if(sender === 1){
                var div = $('<div class="playerOneChat clear-fix ml-2 mr-2 row"><div class="playerOneColor mb-2 text-white rounded pt-2 pr-2 pl-2 pb-2" ><p class="ml-2 mr-2 mt-2 mb-2 d-inline">' + textValue + '</p></div></div>');
                $("#chatMessages").append(div);
            }
            else if(sender === 2){
                var div = $('<div class="playerTwoChat clear-fix ml-2 mr-2 row"><div class="playerTwoColor mb-2 text-white rounded pt-2 pr-2 pl-2 pb-2" ><p class="ml-2 mr-2 mt-2 mb-2 d-inline">' + textValue + '</p></div></div>');
                $("#chatMessages").append(div);
            }
      })
    }    
    else if(snapshot.key === "playersOnline"){
        playerOne = Object.keys(snapshot.val())[0];
        playerTwo = Object.keys(snapshot.val())[1];
        if(playerTwo === undefined){
            $("#waiting").show();
            $("#lobby").show();
            setTimeout(function(){
                window.location.reload(1);
            }, 5000);
        }
        else{
            $("#waiting").hide();
            var gameDisplay = $("#gameDisplay");
            if(uid === playerOne){
                var column1 = $("#column1");
                database.ref().update({
                    ['playersOnline/' + uid + '/gameDetails/playerNumber/']: 1
                })
                letsPlay();
                $("#userText").hide();
                $("#lobby").hide();
                $("#playerOne").show();
                $("#playerTwo").hide();
                $("#playerOneBackground").removeClass("playerOneColor");
                $("#game").prepend(gameDisplay);
                $("#game").prepend(column1);
                $(".playerOneChat").css("float","right");
                $(".playerTwoChat").css("float","left");
            }
            else if (uid === playerTwo){
                var column2 = $("#column2");
                database.ref().update({
                    ['playersOnline/' + uid + '/gameDetails/playerNumber/']: 2
                })
                letsPlay();
                $("#userText").hide();
                $("#lobby").hide();
                $("#playerOne").hide();
                $("#playerTwo").show();
                $("#playerTwoBackground").removeClass("playerTwoColor");
                $("#game").prepend(gameDisplay);
                $("#game").prepend(column2);
                $(".playerOneChat").css("float","left");
                $(".playerTwoChat").css("float","right");
            }
            else{
                $("#lobby").show();
                $("#userText").show();
                $("#userText").text("Oh no! Looks like you'll need to wait in line.");
            }
        }
    }
});
//
database.ref().orderByKey().on("child_changed", function(snapshot){
    if(snapshot.key === "messages"){
        $("#chatMessages").empty();
        snapshot.forEach(function(child){
            var sender = child.val().sender;
            var textValue = child.val().text;
            if(sender === 1){
                var div = $('<div class="playerOneChat clear-fix ml-2 mr-2 row"><div class="playerOneColor mb-2 text-white rounded pt-2 pr-2 pl-2 pb-2" ><p class="ml-2 mr-2 mt-2 mb-2 d-inline">' + textValue + '</p></div></div>');
                $("#chatMessages").append(div);
            }
            else if(sender === 2){
                var div = $('<div class="playerTwoChat clear-fix ml-2 mr-2 row"><div class="playerTwoColor mb-2 text-white rounded pt-2 pr-2 pl-2 pb-2" ><p class="ml-2 mr-2 mt-2 mb-2 d-inline">' + textValue + '</p></div></div>');
                $("#chatMessages").append(div);
            }
      })
    }  
    else if(snapshot.key === "playersOnline"){
        playerOne = Object.keys(snapshot.val())[0];
        playerTwo = Object.keys(snapshot.val())[1];
        gameNumber = snapshot.val()[uid].gameDetails.game;
        gameNumber1 = snapshot.val()[playerOne].gameDetails.game;
        gameNumber2 = snapshot.val()[playerTwo].gameDetails.game;
        $("#roundNumber").text(gameNumber);
        $("#roundNumber").parent().removeAttr("disabled");
        if(playerOne !== undefined){
            playerOneSelect = snapshot.val()[playerOne].gameDetails.selection
            if(uid === playerOne){
                $("#playerOne").show();
                $("#playerTwo").hide();
                $("#selectionOne").hide();
                $(".playerOneChat").css("float","right");
                $(".playerTwoChat").css("float","left");
            }
        }
        if(playerTwo !== undefined){
            playerTwoSelect = snapshot.val()[playerTwo].gameDetails.selection
            if(uid === playerTwo){
                $("#playerOne").hide();
                $("#playerTwo").show();
                $("#selectionTwo").hide();
                $(".playerOneChat").css("float","left");
                $(".playerTwoChat").css("float","right");
            
            }
        }
        if(playerOneSelect !== ""){
            $("#selectionMadeOne h4").removeClass("invisible");
        }
        if(playerTwoSelect !== ""){
            $("#selectionMadeTwo h4").removeClass("invisible");
        }   
        chooseWinner();
    }
});
function animateTitle(){
    $("#titleRock").addClass("text-danger");
    $("#titlePaper").addClass("text-warning");
    $("#titleScissors").addClass("text-success");
    $("#titleRock").delay(1000);
    $("#titlePaper").delay(1500);
    $("#titleScissors").delay(2000);
    $(".title span").animate({opacity: '0.2'},"slow");
    $(".title span").animate({opacity: '1'}, "slow");
}
//
function letsPlay(){
    $("#lobby").hide();
    $("#game").show();
    $("#playerOne").empty();
    $("#playerTwo").empty();
    var playerOneRock =     $('<div class="card mx-auto mx-2 my-2" style="width:20rem;"><button id="rockPlayerOne" data-value="rock" onclick="playerOneButton(this)" class="playerOne playerOneColor rounded-0 text-center btn"><i class="far fa-hand-rock fa-7x"></i></button><div class="card-block bg-white"><h4 class="card-title">Rock</h4></div></div>');
    var playerOnePaper =    $('<div class="card mx-auto mx-2 my-2" style="width:20rem;"><button id="paperPlayerOne" data-value="paper" onclick="playerOneButton(this)" class="playerOne playerOneColor rounded-0 text-center btn"><i class="far fa-hand-paper fa-7x"></i></button><div class="card-block"><h4 class="card-title">Paper</h4></div></div>');
    var playerOneScissors = $('<div class="card mx-auto mx-2 my-2" style="width:20rem;"><button id="scissorsPlayerOne" data-value="scissors" onclick="playerOneButton(this)" class="playerOne playerOneColor rounded-0 text-center btn"><i class="far fa-hand-scissors fa-7x"></i></button><div class="card-block"><h4 class="card-title">Scissors</h4></div></div>');
    var playerOneLizard =   $('<div class="card mx-auto mx-2 my-2" style="width:20rem;"><button id="lizardPlayerOne" data-value="lizard" onclick="playerOneButton(this)" class="playerOne playerOneColor rounded-0 text-center btn"><i class="far fa-hand-lizard fa-7x"></i></button><div class="card-block"><h4 class="card-title">Lizard</h4></div></div>');
    var playerOneSpock =    $('<div class="card mx-auto mx-2 my-2" style="width:20rem;"><button id="spockPlayerOne" data-value="spock" onclick="playerOneButton(this)" class="playerOne playerOneColor rounded-0 text-center btn"><i class="far fa-hand-spock fa-7x"></i></button><div class="card-block"><h4 class="card-title">Spock</h4></div></div>');
    $("#playerOne").append(playerOneRock);
    $("#playerOne").append(playerOnePaper);
    $("#playerOne").append(playerOneScissors);
    $("#playerOne").append(playerOneLizard);
    $("#playerOne").append(playerOneSpock);
    var playerTwoRock =     $('<div class="card mx-auto mx-2 my-2" style="width:20rem;"><button id="rockPlayerTwo" data-value="rock" onclick="playerTwoButton(this)" class="playerTwo playerTwoColor rounded-0 text-center btn"><i class="far fa-hand-rock fa-7x"></i></button><div class="card-block"><h4 class="card-title">Rock</h4></div></div>');
    var playerTwoPaper =    $('<div class="card mx-auto mx-2 my-2" style="width:20rem;"><button id="paperPlayerTwo" data-value="paper" onclick="playerTwoButton(this)" class="playerTwo playerTwoColor rounded-0 text-center btn"><i class="far fa-hand-paper fa-7x"></i></button><div class="card-block"><h4 class="card-title">Paper</h4></div></div>');
    var playerTwoScissors = $('<div class="card mx-auto mx-2 my-2" style="width:20rem;"><button id="scissorsPlayerTwo" data-value="scissors" onclick="playerTwoButton(this)" class="playerTwo playerTwoColor rounded-0 text-center btn"><i class="far fa-hand-scissors fa-7x"></i></button><div class="card-block"><h4 class="card-title">Scissors</h4></div></div>');
    var playerTwoLizard =   $('<div class="card mx-auto mx-2 my-2" style="width:20rem;"><button id="lizardPlayerTwo" data-value="lizard" onclick="playerTwoButton(this)" class="playerTwo playerTwoColor rounded-0 text-center btn"><i class="far fa-hand-lizard fa-7x"></i></button><div class="card-block"><h4 class="card-title">Lizard</h4></div></div>');
    var playerTwoSpock =    $('<div class="card mx-auto mx-2 my-2" style="width:20rem;"><button id="spockPlayerTwo" data-value="spock" onclick="playerTwoButton(this)" class="playerTwo playerTwoColor rounded-0 text-center btn"><i class="far fa-hand-spock fa-7x"></i></button><div class="card-block"><h4 class="card-title">Spock</h4></div></div>');
    $("#playerTwo").append(playerTwoRock);
    $("#playerTwo").append(playerTwoPaper);
    $("#playerTwo").append(playerTwoScissors);
    $("#playerTwo").append(playerTwoLizard);
    $("#playerTwo").append(playerTwoSpock);
};
//
function chooseWinner(){
    if(playerOneSelect !== "" && playerTwoSelect !== ""){
        animateTitle();
        setTimeout(function(){
            $(".title span").css("opacity","1");
            $(".title span").removeClass("text-danger text-warning text-success");
            var game = "";
            $(".playerOne").attr("disabled","disabled");
            $(".playerTwo").attr("disabled","disabled");
            $("#playerOne").show();
            $("#playerTwo").show();
            $("#selectionOne").hide();
            $("#selectionTwo").hide();
            if(playerOneSelect === playerTwoSelect){
                game = "tie"
                $("#gameOutcome").text("It's a " + game + "!");
                $("#" + playerOneSelect + "PlayerOne").addClass("btn-warning");
                $("#" + playerTwoSelect + "PlayerTwo").addClass("btn-warning");
                $("#" + playerOneSelect + "PlayerOne").removeClass("playerOneColor");
                $("#" + playerTwoSelect + "PlayerTwo").removeClass("playerTwoColor");
            }
            else{
                if(playerOneSelect === "rock" && playerTwoSelect === "scissors" || playerOneSelect === "paper" && playerTwoSelect === "rock" || playerOneSelect === "scissors" && playerTwoSelect === "paper" || playerOneSelect === "rock" && playerTwoSelect === "lizard" || playerOneSelect === "lizard" && playerTwoSelect === "spock" || playerOneSelect === "spock" && playerTwoSelect === "scissors" || playerOneSelect === "scissors" && playerTwoSelect === "lizard" || playerOneSelect === "lizard" && playerTwoSelect === "paper" || playerOneSelect === "paper" && playerTwoSelect === "spock"  || playerOneSelect === "spock" && playerTwoSelect === "rock"){
                    game = "Player 1"
                    $("#" + playerOneSelect + "PlayerOne").addClass("btn-success");
                    $("#" + playerTwoSelect + "PlayerTwo").addClass("btn-danger");
                    $("#" + playerOneSelect + "PlayerOne").removeClass("playerOneColor");
                    $("#" + playerTwoSelect + "PlayerTwo").removeClass("playerTwoColor");
                }
                else{
                    game = "Player 2"
                    $("#" + playerTwoSelect + "PlayerTwo").addClass("btn-success");
                    $("#" + playerOneSelect + "PlayerOne").addClass("btn-danger");
                    $("#" + playerOneSelect + "PlayerOne").removeClass("playerOneColor");
                    $("#" + playerTwoSelect + "PlayerTwo").removeClass("playerTwoColor");
                }
            }
            $("#trophy").removeClass("invisible");
            $("#playerOneBackground").removeClass("playerOneColor");
            $("#playerTwoBackground").removeClass("playerTwoColor");
            if(game === "tie"){
                $("#gameOutcome").text("It's a " + game + "!");
            }
            else{
                $("#gameOutcome").text(game + " is the winner!");
            }
            $("#roundNumber").parent().attr("disabled","disabled");
        }, 3900);
    }
};
//
function playerOneButton(button){
    playerOneSelect = $(button).data("value");
    $(".playerOne").attr("disabled","disabled");
    database.ref().update({
        ['playersOnline/' + uid + '/gameDetails/selection/']: playerOneSelect
    })
};
//
function playerTwoButton(button){
    playerTwoSelect = $(button).data("value");
    $(".playerTwo").attr("disabled","disabled");
    database.ref().update({
        ['playersOnline/' + uid + '/gameDetails/selection/']: playerTwoSelect
    })
};
//
function reset(){
    $(".btn").removeClass("btn-warning");
    $(".btn").removeClass("btn-success");
    $(".btn").removeClass("btn-danger");
    $("#trophy").addClass("invisible");
    $(".playerOne").addClass("playerOneColor");
    $(".playerTwo").addClass("playerTwoColor");
    $("#selectionMadeOne h4").addClass("invisible");
    $("#selectionMadeTwo h4").addClass("invisible");
    gameNumber = gameNumber + 1;
    playerOneSelect = "";
    playerTwoSelect = "";
    database.ref().update({
        ['playersOnline/' + playerOne + '/gameDetails/selection']: "",
        ['playersOnline/' + playerTwo + '/gameDetails/selection']: "",
        ['playersOnline/' + uid + '/gameDetails/game']: gameNumber
    });
    if(uid === playerOne){
        $("#playerTwoBackground").addClass("playerTwoColor");
        $("#selectionOne").hide();
        $("#selectionTwo").show();
        $("#playerTwo").hide();
    }
    else if(uid === playerTwo){
        $("#playerOneBackground").addClass("playerOneColor");
        $("#selectionOne").show();
        $("#selectionTwo").hide();
        $("#playerOne").hide();
    }
    if(gameNumber1 === gameNumber2){
        $(".btn").removeAttr("disabled","disabled");
    }
    else{
        refreshPage();
    }
};
//
function refreshPage(){
    setTimeout(function(){        
        if(gameNumber1 === gameNumber2){
            $(".btn").removeAttr("disabled","disabled");
        }
        else{
            refreshPage();
        }
    }, 3000);
}
//

function exitButton(){
    $(popUp).modal("hide");
    window.open('', '_self', ''); window.close();
};

function exitGame(){
    popUp = $('<div class="modal fade"><div class="modal-dialog" role="document"><div class="modal-content"><div class="modal-header"><h5 class="modal-title">Exit</h5><button type="button" class="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">&times;</span></button></div><div class="modal-body"><p>Are you sure you want to quit?</p></div><div class="modal-footer"><button type="button" onclick="exitButton()" class="btn btn-primary">Exit Game</button><button type="button" class="btn btn-secondary" data-dismiss="modal">Close</button></div></div></div></div>');
    $(popUp).modal("show");
    window.open('', '_self', ''); window.close();
}

function sendChat(){
    event.preventDefault();
    var chatText = $("#chatText").val();
    $("#chatText").val("");
    if(uid === playerOne){
        chatPlayer = 1;
    }
    else if(uid === playerTwo){
        chatPlayer = 2;
    }
    var message = {
        sender: chatPlayer,
        text: chatText,       
    }
    chatRef.push(message);     
}

window.onload = function(){
    $("#login,#game").hide();
    $("lobby").show();
};