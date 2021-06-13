let arr;
beforeEach(function(){
  jasmine.getFixtures().fixturesPath = '';
  loadFixtures('../templates/index.html')
});


describe("Boggle", function(){
  it("starts game", async function(){
    spyOn(axios, 'get').and.returnValue({
      data: {
        gameId: 1,
        board: [
          ["C", "A", "T", "S", "A"]
        ]
      }
    });
    await start();
    expect(axios.get).toHaveBeenCalled();
    expect($('table')).toHaveHtml("<tr><td>C</td><td>A</td><td>T</td><td>S</td><td>A</td></tr>")
  });
});