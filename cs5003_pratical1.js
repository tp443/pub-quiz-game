// Initial Tallys
var questionNumber = 0;
var totalWrong = 0;
var totalRight = 0;
var count = 30;

//As progresbar is out of 100
var visCount = 30 * (10 / 3);
var bank = 0;
var cashOut = 0;

//Check marker to see if user has used lifelines
var selected5050 = 0;
var selected30s = 0;
var selectedAudience = 0
var optionSelected = 0;

// Push all fetch results into seperate arrays so can be easily accessed
var allQu = []
var correctAnswers = []
var allOptions = []

//Called when user wants to play again
function resetVariables() {
  questionNumber = 0;
  totalWrong = 0;
  totalRight = 0;
  selected5050 = 0;
  selected30s = 0;
  selectedAudience = 0;
  optionSelected = 0;
  allQu = []
  correctAnswers = []
  allOptions = []
  count = 30;
  visCount = count * 10 / 3;
  bank = 0;
  cashOut = 0;
}

//When game is restarted reset progres bar to orignal css
function resetProgressBar() {
  $(".progressPoint").css({
    "max-width": "40px",
    "background": "grey",
    "color": "black",
    "margin": "10px",
    "margin-right": "10px",
    "display": "inline-block",
    "font-weight": "normal",
    "padding": "10px"
  })
  $('#Q4').css({
    "border-color": "red"
  })
  $('#Q7').css({
    "border-color": "red"
  })
}

//Splitting JSON into sperate arrays so can be easily accessed later
function loadQuestions(json) {
  for (results of json.results) {
    //Array for the 10 questions
    allQu.push(results.question);
    //All Correct Answers
    correctAnswers.push(results.correct_answer);
    //Array for the options (incorrect and correct) for each question
    results.incorrect_answers.push(results.correct_answer);
    allOptions.push(results.incorrect_answers);
  }
  console.log(correctAnswers);
  shuffleQuestions(allOptions);
  displayQuestion(questionNumber);
  revealQu();
}

/*Show question to user when everything is loaded
    Hide start screen*/
function revealQu() {
  $('aside').hide(1000);
  $('#mainArea').show(1000);
  $('#audienceParticipation').hide();
}

//Shuffle subarrays
function shuffleQuestions(array) {
  for (var idx = 0; idx < array.length; idx++) {

    var j, x, i;

    for (i = array[idx].length - 1; i > 0; i--) {
      j = Math.floor(Math.random() * (i + 1))
      x = array[idx][i];
      array[idx][i] = array[idx][j];
      array[idx][j] = x;
    }
  }
}

//Shuffle arrays
function shuffleArray(array) {
  var j, x, i;

  for (i = array.length - 1; i > 0; i--) {
    j = Math.floor(Math.random() * (i + 1))
    x = array[i];
    array[i] = array[j];
    array[j] = x;
  }
}

// Display Question to user
function displayQuestion(question) {
  //Attacth question and options to markers
  $('#question').off().html(allQu[question]);
  $('#firstOption').off().html(allOptions[question][0]);
  $('#secondOption').off().html(allOptions[question][1]);
  $('#thirdOption').off().html(allOptions[question][2]);
  $('#fourthOption').off().html(allOptions[question][3]);
  //Signify user's positon in quiz
  $("#Q" + (question + 1)).css({
    "font-weight": "bold"
  });

  //Reveal lifelines only if they have not been used before
  if (selected30s == 0) {
    $('#30').show();
  }

  if (selectedAudience == 0) {
    $('#askAudience').show();
  }

  if (selected5050 == 0) {
    $('#5050').show();
  }

  //Hide buttons to skip question/quit/cashout
  $('#nextQu').hide();
  $('#cashOut').hide();
  $('#quit').hide();

  //Ready for user to make a selection
  userSelection(questionNumber);
}


function userSelection(i) {
  //Timers
  var visualCounter = setInterval(visualTimer, (1000 * 0.3));
  var counter = setInterval(timer, 1000);

  //Lifelines
  $('#5050').click(fiftyFifty);
  $('#askAudience').click(askTheAudience);

  //Paraphrased from CS5003-W3-Solution.html
  function visualTimer() {
    if (visCount <= 0) return;
    $('#visualTimer').progressbar().css('background', 'green');
    visCount--;
    $('#visualTimer').progressbar('value', visCount);
    if (visCount < 50)
      $('#visualTimer').progressbar().css('background', 'orange');
    if (visCount < 25)
      $('#visualTimer').progressbar().css('background', 'red');
    if (visCount < 2) {
      clearInterval(visualCounter)
    }
  }

  function timer() {
    count--;
    optionSelected++;

    $('#timer').text("Time Left: " + count + " s");
    if (count <= 0) {

      //User can no longer make a selection
      turnOffOptions(optionSelected);
      clearInterval(counter);;
      wrong();

      //Highlight question that was answered wrong
      $(".option").css({
        "background-color": "red",
      })

      return;
    }

    //Lifeline to add 30s
    $('#30').click(function() {
      selected30s++;

      //Prevents double clicking and adding more than 30s
      if (selected30s == 1) {
        count += 30;
        visCount += (30 * 10 / 3);

        //Can no longer selected lifeline
        $('#30').fadeOut(1000);
        $('#timer').fadeIn(200).fadeOut(200).fadeIn(200).fadeOut(200).fadeIn(200).fadeOut(200).fadeIn(200).fadeOut(200).fadeIn(200);
      }
    })
  }

  //Waiting for user to click an answer
  $(".option").click(function() {
    optionSelected++;
    //See if slected answer is correct or not
    if ($(this).text() === correctAnswers[i]) {
      correct();
      $(this).css({
        "background-color": "green",
        "font-weight": "bold"
      })
    } else {
      wrong();
      $(this).css({
        "background-color": "red",
      })
    }

    //Stop timers when user has made a selection
    clearInterval(counter)
    clearInterval(visualCounter)

    //User can no make another attempt
    turnOffOptions(optionSelected)
  })
  //Reset timers
  count = 30;
  visCount = 30 * (10 / 3);
}

//To prevent user making a selection when they have made 1 selection or time has run out
function turnOffOptions(x) {
  if (questionNumber == 10) {
    $('#nextQu').hide();
    endGame(2);
  };

  $('#nextQu').show();

  //Cash out, when there is money - Quit, when they have no money
  if (totalRight > 0) {
    $('#cashOut').show();
  } else {
    $('#quit').show();
  }

  //Can not use lifelines
  $('#5050').hide();
  $('#30').hide();
  $('#askAudience').hide();
  $('#audienceParticipation').hide();

  visCount = 30 * (10 / 3)
  //turn off options
  if (x >= 1) {
    $(".option").off();
  }
}

//If answred correctly
function correct() {
  totalRight++;
  questionNumber++;

  //Highlight to show it is correct
  $("#Q" + (questionNumber)).css({
    "background-color": "green",
  });
  prizeFund(totalRight)
}

//Wrong answer selected
function wrong() {
  totalWrong++;
  questionNumber++;

  //Though the same total right as previosu question - prize fund has to be worked out if the user has lost all 3 lives
  prizeFund(totalRight);
  $(lives).off().text('Lives:' + (3 - totalWrong))

  //Highlight to show it is wrong
  $("#Q" + (questionNumber)).css({
    "background-color": "red",
    "font-weight": "bold"
  });

  //End game if lost all lives
  if (totalWrong == 3) {
    endGame(1);
  }
}

//Establish how much they have earnt
function prizeFund(numberRight) {
  var difficulty;
  //Define diffuculty based on user selection at start of quiz
  switch ($('#selectDifficulty').val()) {
    case "easy":
      difficulty = 1;
      break;
    case "medium":
      difficulty = 1.5;
      break;
    case "hard":
      difficulty = 2;
      break;
  }

  var prize = 20 * totalRight * difficulty;
  $('#prizeMoney').off().text('Prize Money: £' + prize)

  //Bank money if they reach checkpoint
  if (questionNumber == 4 || questionNumber == 7) {
    bank = 20 * totalRight * difficulty;
    $('#bank').off().text('Bank: £' + bank)
    //Show checkpoint has been reached on progress bar
    if (questionNumber == 4) {
      $('#Q4').css({
        "border-color": "green"
      })
    }
    if (questionNumber == 7) {
      $('#Q7').css({
        "border-color": "green"
      })
    }
  }

  // Log final prize in leaderboard table
  if (totalWrong == 3) {
    enterEntry(bank);
  } else if (questionNumber == 10 || totalWrong == 3) {
    enterEntry(prize);
  }
}

//When next question button is selected
function nextQu() {
  //Restart if option was selected
  optionSelected--;

  $("#Q" + (questionNumber)).css({
    "font-weight": "normal"
  });
  //reset options and questions
  resetColours();
  displayQuestion(questionNumber);
}

//Options colours
function resetColours() {
  $('.option').css({
    "max-width": "300px",
    "background": "lightblue",
    "color": "black",
    "margin": "10px",
    "margin-right": "10px",
    "display": "inline-block",
    "padding": "10px",
    "border-radius": "10px",
    "font-weight": "normal"
  })
}


//Ask the audience lifeline - these numbers are randomly generated to simulate an audience
function askTheAudience() {
  //Check mark so that lifeline can not be used again
  selectedAudience++;
  if (selectedAudience == 1) {
    $("#audienceParticipation").show();
    $('#askAudience').fadeOut(1000);
    //Weighting for answers, so correct answer is most likely to be chosen - NOT ALL THE TIME THOUGH!
    var weightCorrect = 0.5;
    var weightWrong1 = 0.2;
    var weightWrong2 = 0.2;
    var weightWrong3 = 0.1;
    // Random propoababilty of options being chosen by "audience"
    var scoreCorrect = weightCorrect * Math.random();
    var scoreWrong1 = weightWrong1 * Math.random();
    var scoreWrong2 = weightWrong2 * Math.random();
    var scoreWrong3 = weightWrong3 * Math.random();
    var totalRandom = scoreCorrect + scoreWrong1 + scoreWrong2 + scoreWrong3
    // Make sure that the sum of score add up to 100 so can be represented on a bar chart
    var audienceCorrect = Math.round(100 * scoreCorrect / totalRandom)
    var audienceWrong1 = Math.round(100 * scoreWrong1 / totalRandom)
    var audienceWrong2 = Math.round(100 * scoreWrong2 / totalRandom)
    var audienceWrong3 = Math.round(100 * scoreWrong3 / totalRandom)
    var summing = audienceCorrect + audienceWrong1 + audienceWrong2 + audienceWrong3;
    //Label bar chart
    $('#heading0').off().text(allOptions[questionNumber][0])
    $('#heading1').off().text(allOptions[questionNumber][1])
    $('#heading2').off().text(allOptions[questionNumber][2])
    $('#heading3').off().text(allOptions[questionNumber][3])

    // Locate correct answer
    var locationCorrect = allOptions[questionNumber].indexOf(correctAnswers[questionNumber])
    //Incorrect options
    allOptions[questionNumber].splice(locationCorrect, 1)
    var wrongAudience = [];
    wrongAudience.push(audienceWrong1, audienceWrong2, audienceWrong3)
    shuffleArray(wrongAudience)

    //Assign correct probabilty to the correct answer location. Distrubute wrong probabailities to other variables.
    switch (locationCorrect) {
      case 0:
        //Correct Answer at location 0
        $('.zero').css("width", audienceCorrect + "%");
        $('.zero').text(audienceCorrect + "%")
        $('.one').css("width", wrongAudience[0] + "%");
        $('.one').text(wrongAudience[0] + "%")
        $('.two').css("width", wrongAudience[1] + "%");
        $('.two').text(wrongAudience[1] + "%")
        $('.three').text(wrongAudience[2] + "%")
        $('.three').css("width", wrongAudience[2] + "%");
        break;
      case 1:
        //Correct Answer at location 1
        $('.one').css("width", audienceCorrect + "%");
        $('.one').text(audienceCorrect + "%")
        $('.zero').css("width", wrongAudience[0] + "%");
        $('.zero').text(wrongAudience[0] + "%")
        $('.two').css("width", wrongAudience[1] + "%");
        $('.two').text(wrongAudience[1] + "%")
        $('.three').text(wrongAudience[2] + "%")
        $('.three').css("width", wrongAudience[2] + "%");
        break;
      case 2:
        //Correct Answer at location 2
        $('.two').css("width", audienceCorrect + "%");
        $('.two').text(audienceCorrect + "%")
        $('.one').css("width", wrongAudience[0] + "%");
        $('.one').text(wrongAudience[0] + "%")
        $('.zero').text(wrongAudience[1] + "%")
        $('.zero').css("width", wrongAudience[1] + "%");
        $('.three').text(wrongAudience[2] + "%")
        $('.three').css("width", wrongAudience[2] + "%");
        break;
      case 3:
        //Correct Answer at location 3
        $('.three').css("width", audienceCorrect + "%");
        $('.three').text(audienceCorrect + "%")
        $('.one').css("width", wrongAudience[0] + "%");
        $('.one').text(wrongAudience[0] + "%")
        $('.two').css("width", wrongAudience[1] + "%");
        $('.two').text(wrongAudience[1] + "%")
        $('.zero').text(wrongAudience[2] + "%")
        $('.zero').css("width", wrongAudience[2] + "%");
        break;
    }
  }
}

//Fiftyfifty lifeline
function fiftyFifty() {
  //Prevents double clicking it
  selected5050++;
  if (selected5050 == 1) {
    if (selectedAudience != 1) {
      var location = allOptions[questionNumber].indexOf(correctAnswers[questionNumber])
      allOptions[questionNumber].splice(location, 1);
    }
    //find correct location
    var randnums = []
    while (randnums.length < 2) {
      var randomnumber = Math.floor(Math.random() * 3);
      if (randnums.indexOf(randomnumber) > -1) continue;
      randnums[randnums.length] = randomnumber;
    }
    //remove 2 random wrong answers
    var removeOption = allOptions[questionNumber][randnums[0]];
    var removeOption2 = allOptions[questionNumber][randnums[1]];
    $("section:contains('" + removeOption + "')").hide();
    $("section:contains('" + removeOption2 + "')").hide();
    $('#5050').fadeOut(1000);
  }
}

//If user selects that they want to play again. Reset game
function restart() {
  $('aside').show();
  $('#mainArea').hide();
  $('#endGame').hide();
  $('#table').show();
  $('#prizeMoney').off().text('Prize Money: £0')
  $('#lives').off().text('Lives:3');
  $('#bank').off().text('Bank: £0');
  resetColours();
  resetProgressBar();
  resetVariables();
}

// Leaderboard for entries
board = []

function enterEntry(winnings) {
  userScore = {
    time: new Date().toLocaleString(),
    name: $('#name').val(),
    surname: $('#surname').val(),
    won: winnings
  }

  //Paraphrased from CS5003-W1
  board.push(userScore);
  board.sort(function(a, b) {
    if (a.won < b.won) return 1;
    else return -1;
  });
}


//Paraphrased from CS5003-W2-Solution1.html
function printLeaderboard(users) {
  var output = "<table><tr><th>Date</th><th>Name</th><th>Surname</th><th>Winnings (£)</th></tr>";

  for (user of users) {
    output = output + "<tr><td>" + user.time + "</td><td>" + user.name + "</td><td>" + user.surname + "</td><td>" + user.won + "</td></tr>";
  }
  output = output + "</table>"
  return output;
}

/* When the game has ended.
 x is the variable that shows how the game was ended
 1 = All lives were lost
 2 = Game ended due to answering all questions
 3 = User quit
 */
function endGame(x) {
  $('#mainArea').hide(1000);
  $('#endGame').show(1000);
  //Display userboard
  $('#table').show(1000);
  document.getElementById("leaderboardTable").innerHTML = printLeaderboard(board);
  if (x == 1) {
    $('#commiserations').off().text('Game Over! You lost all your lives');
    $('#finalPrize').off().text("Fortuanetly you passed the checkpoint so you still go away with £" + bank + "!");
  } else if (x == 2) {
    $('#commiserations').off().text('Congratulations! You won!!');
    $('#finalPrize').off().text($('#prizeMoney').text());
  } else if (x == 3) {
    $('#commiserations').off().text('Always better to quit while you are ahead');
    $('#finalPrize').off().text($('#prizeMoney').text());
  } else {
    $('#commiserations').off().text('In a rush?');
  }
}

// Token obtained from JSON - A question should not be repeated until the page is reloaded.
function getToken(json) {
  var tokenvalue = json.token;
  return tokenvalue;
}



function startQuiz() {

  var category = "&category=" + $("#selectCAtegory").val();
  if ($("#selectCAtegory").val() == 8) {
    category = ""
  }
  console.log(category);

  // find token
  var myToken = "https://opentdb.com/api_token.php?command=request"
  fetch(myToken)
    .then(response => response.json())
    .then(response => (getToken(response)))
    //Attatch token and difficulty to URL
    .then(token => {
      fetch("https://opentdb.com/api.php?amount=10&difficulty=" + $('#selectDifficulty').val() + category + "&type=multiple&token=" + token)
        .then(res => res.json())
        .then(res => loadQuestions(res))
    })
}

//Run when page loads
$(function() {
  $('#mainArea').hide()
  $('#endGame').hide()
  $('#table').hide()
  $('#visualTimer').progressbar();
  $("#audienceParticipation").hide();
})
