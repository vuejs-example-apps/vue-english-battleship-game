var Grid = Vue.component('Grid', function (resolve, reject) {
    ajax.get("/components/Grid.tpl.html", function (template_string) {
        resolve({
            template: template_string,
            props: ['name', 'words', 'mode', 'ships', 'shots'],
            methods: {
                word_for_cell: function (cell_name) {
                    var row = cell_name.charCodeAt(0) - 'a'.charCodeAt(0);
                    var col = parseInt(cell_name.slice(1)) - 1;
                    return this.words[row][col];
                },
                handle_cell_shot: function (cell_name) {
                    var previous_shot = this.shots[cell_name];
                    if (previous_shot && previous_shot !== 'aimed') {
                        return;
                    }                                        
                    var hit = confirm("Whas it a hit?")
                    if (!hit) {
                        this.$emit('shot', cell_name, 'miss');
                        return 
                    }
                    // var verb = prompt("What verb was there?");
                    // alert(`Now tell me the 2nd / 3rd form for the verb: ${verb} - ? - ?`);
                    var confirmed = confirm("Were you familiar with this verb`s forms?");
                    this.$emit('shot', cell_name, confirmed ? 'injured' : 'aimed');
                }
            },
            data: function () {
                return {
                    grid: [
                        ['a1', 'a2', 'a3', 'a4', 'a5', 'a6', 'a7', 'a8', 'a9', 'a10'],
                        ['b1', 'b2', 'b3', 'b4', 'b5', 'b6', 'b7', 'b8', 'b9', 'b10'],
                        ['c1', 'c2', 'c3', 'c4', 'c5', 'c6', 'c7', 'c8', 'c9', 'c10'],
                        ['d1', 'd2', 'd3', 'd4', 'd5', 'd6', 'd7', 'd8', 'd9', 'd10'],
                        ['e1', 'e2', 'e3', 'e4', 'e5', 'e6', 'e7', 'e8', 'e9', 'e10'],
                        ['f1', 'f2', 'f3', 'f4', 'f5', 'f6', 'f7', 'f8', 'f9', 'f10'],
                        ['g1', 'g2', 'g3', 'g4', 'g5', 'g6', 'g7', 'g8', 'g9', 'g10'],
                        ['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'h7', 'h8', 'h9', 'h10'],
                        ['i1', 'i2', 'i3', 'i4', 'i5', 'i6', 'i7', 'i8', 'i9', 'i10'],
                        ['j1', 'j2', 'j3', 'j4', 'j5', 'j6', 'j7', 'j8', 'j9', 'j10']
                    ]
                }
            }
        });    
    });
});