from unittest import TestCase

from app import app, games

# Make Flask errors be real errors, not HTML pages with error info
app.config['TESTING'] = True

# This is a bit of hack, but don't use Flask DebugToolbar
app.config['DEBUG_TB_HOSTS'] = ['dont-show-debug-toolbar']


class BoggleAppTestCase(TestCase):
    """Test flask app of Boggle."""

    def setUp(self):
        """Stuff to do before every test."""

        self.client = app.test_client()
        app.config['TESTING'] = True

    def test_homepage(self):
        """Make sure information is in the session and HTML is displayed"""

        with self.client as client:
            response = client.get('/')
            html = response.get_data(as_text=True)
            self.assertEqual(response.status_code, 200)
            self.assertIn('<table class="board">', html)

    def test_api_new_game(self):
        """Test starting a new game."""

        with self.client as client:
            response = client.get("/api/new-game")
            data = response.json
            self.assertEqual(response.status_code, 200)
            self.assertIsInstance(data['gameId'], str)
            self.assertIsInstance(data['board'], list)
            for lst in data['board']:
                self.assertIsInstance(lst, list)
            self.assertIn(data['gameId'], games)

    def test_score_word_integration(self):

        with self.client as client:
            game_response = client.get("/api/new-game")
            id = game_response.json["gameId"]

            game = games[id]
            game.board = [['C', 'A', 'T', 'D', 'E'],
                          ['C', 'B', 'T', 'D', 'E'],
                          ['C', 'B', 'T', 'D', 'E'],
                          ['C', 'Z', 'T', 'D', 'E'],
                          ['C', 'X', 'T', 'D', 'E']]

            score_response_1 = client.post('/api/score-word', json={
                "word": "cat",
                "gameId": id
            })
            result = score_response_1.json["result"]
            self.assertEqual(result, "ok")
            score = score_response_1.json["score"]
            self.assertEqual(score, 1)

            score_response_2 = client.post('/api/score-word',  json={
                "word": "CAT",
                "gameId": id
            })
            result = score_response_2.json["result"]
            self.assertEqual(result, "already played")
            score = score_response_2.json["score"]
            self.assertEqual(score, 1)

            score_response_3 = client.post('/api/score-word',  json={
                "word": "ZEBRA",
                "gameId": id
            })
            result = score_response_3.json["result"]
            self.assertEqual(result, "not on board")
            score = score_response_3.json["score"]
            self.assertEqual(score, 1)

            score_response_4 = client.post('/api/score-word',  json={
                "word": "BTD",
                "gameId": id
            })
            result = score_response_4.json["result"]
            self.assertEqual(result, "not a word")
            score = score_response_4.json["score"]
            self.assertEqual(score, 1)

    def test_api_end_game(self):
        """Test ending a game"""

        with self.client as client:
            game_response = client.get("/api/new-game")
            id = game_response.json["gameId"]

            game = games[id]
            game.board = [['C', 'A', 'T', 'D', 'E'],
                          ['C', 'B', 'T', 'D', 'E'],
                          ['C', 'B', 'T', 'D', 'E'],
                          ['C', 'Z', 'T', 'D', 'E'],
                          ['C', 'X', 'T', 'D', 'E']]

            client.post('/api/score-word', json={
                "word": "cat",
                "gameId": id
            })

            response = client.post("api/end-game", json={
                "gameId": id
            })
            data = response.json
            self.assertEqual(response.status_code, 200)
            self.assertEqual(data["score"], 1)
            self.assertEqual(data["num_words"], 1)
            self.assertEqual(data["high_score"], 1)
            self.assertEqual(data["high_score_num_words"], 1)


