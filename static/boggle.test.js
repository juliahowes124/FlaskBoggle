let arr;

beforeAll(() => {
  jasmine.getFixtures().fixturesPath = '';
  loadFixtures('../templates/index.html')
  spyOn(axios, 'get').and.returnValue({
    data: {
      gameId: 1,
      board: [
        ["C", "A", "T", "S", "A"]
      ]
    }
  });
  spyOn(axios, 'post').and.returnValue({
    data: {
      score: 1,
      num_words: 1,
      high_score: 6,
      high_score_num_words: 3
    }
  });
});

describe("Boggle", function(){
  it("starts and ends game", async function(){
    await start();
    expect(axios.get).toHaveBeenCalled();
    expect($('table')).toHaveHtml("<tr><td>C</td><td>A</td><td>T</td><td>S</td><td>A</td></tr>")
    
    var spyEvent = spyOnEvent($('#newWordForm'), 'submit');
    $("#wordInput").val('CAT');
    $("#newWordBtn").trigger("click");
    expect(spyEvent).toHaveBeenTriggered()
    
    await endGame();
    expect(axios.post).toHaveBeenCalled();
    expect($(".game-msg")).toHaveText("Final Score: 1pts\n                  with 1 words --- High Score: \n                  6pts with 3 words");
  });
});