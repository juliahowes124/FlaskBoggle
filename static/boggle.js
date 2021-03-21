"use strict";

const $playedWords = $("#word_list");
const $form = $("#newWordForm");
const $wordInput = $("#wordInput");
const $message = $(".msg");
const $table = $("table");
const $gameMsg= $(".game-msg");
const $timer = $(".timer");
const $endGame = $('.end-game-msg');

let gameId;
let gameOver = false;

/** Start */

async function start() {
  let response = await axios.get("/api/new-game");
  gameId = response.data.gameId;
  let board = response.data.board;
  displayBoard(board);
  let time = 10;
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
  let response = await axios.post('/api/end-game', {
    gameId
  })
  let finalScore = response.data.score;
  let numWords = response.data.num_words;
  let highScore = response.data.high_score;
  let highScoreNumWords = response.data.high_score_num_words;
  $gameMsg.removeClass('hidden');
  $gameMsg.text(`Final Score: ${finalScore}pts
                  with ${numWords} words --- High Score: 
                  ${highScore}pts with ${highScoreNumWords} words`);
  $message.empty()
  $message.addClass('hidden')
  gameOver = true;
}

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
    $playedWords.append(`<p>${word}</p>`)
    $gameMsg.text(`Score: ${response.data.score}`)
    $message.empty()
    $message.append(`${word.toUpperCase()} added!`)
    $message.removeClass('alert-danger')
    $message.addClass('alert-success')
    $gameMsg.removeClass('hidden');
  } else {
    $message.empty()
    $message.append(response.data["result"])
    $message.removeClass('alert-success')
    $message.addClass('alert-danger')
  }
})

start();