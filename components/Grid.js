var Grid = Vue.component('Grid', function (resolve, reject) {
    ajax.get("/components/Grid.tpl.html", function (template_string) {
        resolve({
            template: template_string,
            props: ['name', 'words', 'mode', 'ships', 'shots', 'mine'],
            methods: {
                word_for_cell: function (cell_name) {
                    var row = cell_name.charCodeAt(0) - 'a'.charCodeAt(0);
                    var col = parseInt(cell_name.slice(1)) - 1;
                    return this.words[row][col];
                },
                handle_cell_shot: function (cell_name) {
                    return this.mine ? this.handle_my_cell_shot(cell_name) : this.handle_enemy_cell_shot(cell_name);
                },
                handle_my_cell_shot: function (cell_name) {
                    var previous_shot = this.shots[cell_name];
                    if (previous_shot && previous_shot !== 'aimed') {
                        return;
                    }
                    var hit = previous_shot == 'aimed' || this.check_ship_presence(cell_name);
                    if (!hit) {
                        this.$emit('shot', cell_name, 'miss');
                        return;
                    }
                    alert('Your ship has been attacked!');
                    var hit_confirmed = confirm(`Is your opponent familiar with the forms of the verb ${this.word_for_cell(cell_name)}?`);
                    this.$emit('shot', cell_name, hit_confirmed ? 'damaged' : 'aimed');
                },
                handle_enemy_cell_shot: function (cell_name) {
                    var previous_shot = this.shots[cell_name];
                    if (previous_shot && previous_shot !== 'aimed') {
                        return;
                    }
                    var hit = previous_shot == 'aimed' || confirm("Was it a hit?")
                    if (!hit) {
                        this.$emit('shot', cell_name, 'miss');
                        return 
                    }
                    // var verb = prompt("What verb was there?");
                    // alert(`Now tell me the 2nd / 3rd form for the verb: ${verb} - ? - ?`);
                    var hit_confirmed = confirm("Were you familiar with this verb`s forms?");
                    if (hit_confirmed) {
                        var destruction_confirmed = confirm("Was the ship destroyed?");
                        this.$emit('shot', cell_name, destruction_confirmed ? 'destroyed' : 'damaged');
                    } else {
                        this.$emit('shot', cell_name, 'aimed');
                    }

                },
                check_ship_presence: function (cell_name) {
                    var row = cell_name.charCodeAt(0) - 'a'.charCodeAt(0);
                    var col = parseInt(cell_name.slice(1)) - 1;
                    for (i in this.ships) {             
                        var ship = this.ships[i];
                        var ship_row = ship.position.charCodeAt(0) - 'a'.charCodeAt(0);
                        var ship_col = parseInt(ship.position.slice(1)) - 1;
                        var ship_located = false;                        
                        if (ship.is_vertical) {        
                            var diff = row - ship_row;
                            if (ship_col == col && diff < ship.size && diff >= 0) {
                                ship_located = true;
                            }
                        } else {
                            // horizontal
                            var diff = col - ship_col;
                            if (ship_row == row && diff < ship.size && diff >= 0) {
                                ship_located = true;
                            }
                            /*
                            Consider ship of size 5 at a3: you want to match on a3, a4, a5, a6, a7 and not a1, a2, a8, a9, a10
                            diff === (col - ship_col) [-2, -1, 0, 1, 2, 3, 4, 5]
                            */
                        }
                        // console.log(cell_name, row, col, ship.position, ship_row, ship_col, ship.is_vertical, ship_located);
                        if (ship_located) {
                            return true;
                        }
                    }
                    return false;
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