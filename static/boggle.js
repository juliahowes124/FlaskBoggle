"use strict";

const $playedWords = $("#word_list");
const $form = $("#newWordForm");
const $wordInput = $("#wordInput");
const $table = $("table");
const $gameMsg = $(".game-msg");
const $timer = $(".timer");
const $endGame = $('.end-game-msg');

let gameId;
let gameOver = false;
let okTimeout = null;
let errTimeout = null;

async function start() {
  $gameMsg.text('Go!')
  let response = await axios.get("/api/new-game");
  gameId = response.data.gameId;
  let board = response.data.board;
  displayBoard(board);
  setTimer();
}

async function endGame() {
  clearTimeouts();
  let {data} = await axios.post('/api/end-game', {
    gameId
  });

  let finalScore = data.score;
  let numWords = data.num_words;
  let highScore = data.high_score;
  let highScoreNumWords = data.high_score_num_words;

  gameOver = true;
  $gameMsg.text(`Final Score: ${finalScore}pts
                  with ${numWords} words --- High Score: 
                  ${highScore}pts with ${highScoreNumWords} words`);
  $gameMsg.removeClass('alert-danger', 'alert-succes').addClass('alert-primary')
  $wordInput.prop( "disabled", true );
  $wordInput.val('');
}

$form.on('submit', async (e) => {
  e.preventDefault();
  if (gameOver) return;
  let word = $wordInput.val();
  $wordInput.val('');
  let response = await axios.post('/api/score-word', {
    gameId,
    word
  })
  if (response.data["result"] === "ok") {
    clearTimeouts();
    $playedWords.append(`<p>${word}</p>`)
    $gameMsg.text(`${word.toUpperCase()} added! Score: ${response.data.score}`)
    $gameMsg.removeClass(['alert-primary', 'alert-danger']).addClass('alert-success')
    okTimeout = setStatusTimeout(response);
    $gameMsg.removeClass('hidden');
  } else {
    clearTimeouts();
    $gameMsg.text(`${response.data["result"]} -- Score: ${response.data.score}`)
    $gameMsg.removeClass(['alert-primary', 'alert-success']).addClass('alert-danger')
    errTimeout = setStatusTimeout(response);
    $gameMsg.removeClass('hidden');
  }
})

/** Display board */

function displayBoard(board) {
  $table.empty();
  for (let row of board) {
    let $row = $('<tr></tr>')
    for (let letter of row) {
      let $cell = $(`<td>${letter}</td>`)
      $row.append($cell)
    }
    $table.append($row)
  }
}

/**Initialize timer and count down until 0 -> then end game */

function setTimer() {
  let time = 60;
  $timer.text(`Time Left: ${time}s`);
  const timer = window.setInterval(async () => {
    time--;
    $timer.text(`Time Left: ${time}s`);
    if (time === 0) {
      window.clearInterval(timer);
      await endGame();
    }
  }, 1000)
}

/** Clear Timouts */

function clearTimeouts() {
  clearTimeout(errTimeout);
  clearTimeout(okTimeout);
}

/** Set Error Timeout */

function setStatusTimeout(response) {
  return window.setTimeout(() => {
    $gameMsg.text(`Score: ${response.data.score}`);
    $gameMsg.removeClass(['alert-success','alert-danger']).addClass('alert-primary');
  }, 2000);
}

start();