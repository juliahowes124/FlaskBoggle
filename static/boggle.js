"use strict";

const $playedWords = $("#words");
const $form = $("#newWordForm");
const $wordInput = $("#wordInput");
const $message = $(".msg");
const $table = $("table");
const $score = $(".score");
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
  let time = 60;
  $timer.text(`Time Left: ${time}s`);
  const timer = window.setInterval(() => {
    time--;
    $timer.text(`Time Left: ${time}s`);
    if(time === 0) {
      window.clearInterval(timer);
      $endGame.append('Game Over!');
      gameOver = true;
    }
  }, 1000)
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
  if(gameOver) return;
  let word = $wordInput.val();
  let response = await axios.post('/api/score-word', {
    gameId,
    word
  })
  if (response.data["result"] === "ok") {
    $playedWords.append(`<li>${word}</li>`)
    $score.text(`Score: ${response.data.score}`)
  } else {
    $message.append(response.data["result"])
  }
})

start();