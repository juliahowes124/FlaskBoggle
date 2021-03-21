from flask import Flask, request, render_template, jsonify, session
from uuid import uuid4
from wordlist import english_words
from boggle import BoggleGame

app = Flask(__name__)
app.config["SECRET_KEY"] = "this-is-secret"

# The boggle games created, keyed by game id
games = {}
high_score = {"score": 0, "num_words": 0}


@app.route("/")
def homepage():
    """Show board."""

    return render_template("index.html")


@app.route("/api/new-game")
def new_game():
    """Start a new game and return JSON: {game_id, board}."""
    # get a unique id for the board we're creating
    game_id = str(uuid4())
    game = BoggleGame()
    games[game_id] = game
    return {"gameId": game_id, "board": game.board}

@app.route('/api/score-word', methods=["POST"])
def score_word():
    data = request.json
    id = data['gameId']
    word = data['word'].upper()
    if not english_words.check_word(word):
        result = 'not a word'
    elif not games[id].check_word_on_board(word):
        result = 'not on board'
    elif not games[id].is_word_not_a_dup(word):
        result = "already played"
    else:
        result = 'ok'
        games[id].play_and_score_word(word)

    return jsonify({'result': result, 'score': games[id].score})


@app.route('/api/end-game', methods=["POST"])
def end_game():
    id = request.json["gameId"]
    if games[id].score > high_score["score"]:
        high_score["score"] = games[id].score
        high_score["num_words"] = len(games[id].played_words)
    
    return jsonify({"score": games[id].score,
                    "num_words": len(games[id].played_words),
                    "high_score": high_score["score"],
                    "high_score_num_words": high_score["num_words"]})


