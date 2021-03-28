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
  let time = 15;
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

async function endGame() {
  clearTimeout(errTimeout);
  clearTimeout(okTimeout);
  console.log('err: ', errTimeout);
  console.log('ok:', okTimeout);
  let response = await axios.post('/api/end-game', {
    gameId
  })
  let finalScore = response.data.score;
  let numWords = response.data.num_words;
  let highScore = response.data.high_score;
  let highScoreNumWords = response.data.high_score_num_words;
  $gameMsg.text(`Final Score: ${finalScore}pts
                  with ${numWords} words --- High Score: 
                  ${highScore}pts with ${highScoreNumWords} words`);
  $gameMsg.removeClass('alert-danger', 'alert-succes').addClass('alert-primary')
  gameOver = true;
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
    clearTimeout(errTimeout);
    clearTimeout(okTimeout);
    console.debug(errTimeout);
    $playedWords.append(`<p>${word}</p>`)
    $gameMsg.text(`${word.toUpperCase()} added! Score: ${response.data.score}`)
    $gameMsg.removeClass(['alert-primary', 'alert-danger']).addClass('alert-success')
    okTimeout = window.setTimeout(() => {
      console.debug('ok timeout')
      $gameMsg.text(`Score: ${response.data.score}`)
      $gameMsg.removeClass(['alert-success']).addClass('alert-primary')
    }, 2000)
    $gameMsg.removeClass('hidden');
  } else {
    clearTimeout(errTimeout);
    clearTimeout(okTimeout);
    $gameMsg.text(`${response.data["result"]} -- Score: ${response.data.score}`)
    $gameMsg.removeClass(['alert-primary', 'alert-success']).addClass('alert-danger')
    errTimeout = window.setTimeout(() => {
      console.debug('err timeout');
      $gameMsg.text(`Score: ${response.data.score}`)
      $gameMsg.removeClass(['alert-danger']).addClass('alert-primary')
    }, 2000)
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

start();