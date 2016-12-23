var Grid = Vue.component('Grid', function (resolve, reject) {
    ajax.get("/components/Grid.tpl.html", function (template_string) {
        resolve({
            template: template_string,
            props: {
                name: {
                    type: String,
                    required: true,
                    default: 'Unnamed Grid'
                },
                words: {
                    type: Array,
                    required: false,
                    default: function () {
                        return [
                            ["", "", "", "", "", "", "", "", "", ""],
                            ["", "", "", "", "", "", "", "", "", ""],
                            ["", "", "", "", "", "", "", "", "", ""],
                            ["", "", "", "", "", "", "", "", "", ""],
                            ["", "", "", "", "", "", "", "", "", ""],
                            ["", "", "", "", "", "", "", "", "", ""],
                            ["", "", "", "", "", "", "", "", "", ""],
                            ["", "", "", "", "", "", "", "", "", ""],
                            ["", "", "", "", "", "", "", "", "", ""],
                            ["", "", "", "", "", "", "", "", "", ""]
                        ];
                    }
                },
                mode: {
                    type: String,
                    required: true,
                    default: 'game'
                },
                ships_available: {
                    type: Array,
                    required: false,
                    default: function () {
                        return [
                            {
                                "type": "carrier",
                                "size": 5
                            },
                            {
                                "type": "battlecruiser",
                                "size": 4
                            },
                            {
                                "type": "destroyer",
                                "size": 3
                            },
                            {
                                "type": "frigate",
                                "size": 2
                            },
                            {
                                "type": "frigate",
                                "size": 2
                            },
                            {
                                "type": "submarine",
                                "size": 1
                            },
                            {
                                "type": "submarine",
                                "size": 1
                            }
                        ];
                    }
                },
                ships: {
                    type: Array,
                    required: false,
                    default: function () {
                        return [];
                    }
                },
                shots: {
                    type: Object,
                    default: function () {
                        return {};
                    },
                    required: false
                },
                mine: {
                    type: Boolean,
                    required: false,
                    default: true
                }
            },
            methods: {

                word_for_cell: function (cell_name) {
                    var row = cell_name.charCodeAt(0) - 'a'.charCodeAt(0);
                    var col = parseInt(cell_name.slice(1)) - 1;
                    return this.words[row][col];
                },

                handle_cell_click: function (cell_name) {
                    switch (this.mode) {
                        case 'ship-placement':
                                return this._handle_ship_placement_click(cell_name)
                                break;
                        case 'game':
                                return this.mine ?
                                    this._handle_my_shot(cell_name) :
                                    this._handle_enemy_shot(cell_name);
                                break;
                        default:
                            return false;
                    }
                },

                _get_next_available_ship: function () {
                    return this.ships_available[Object.keys(this.ships).length];
                },

                _handle_ship_placement_click: function (cell_name) {
                    var existing_ship = this._get_ship(cell_name);                    
                    console.log('existing_ship', existing_ship);
                    if (existing_ship) {
                        var existing_ship_index = existing_ship[0];
                        existing_ship = existing_ship[1];
                        existing_ship.is_vertical = !existing_ship.is_vertical;
                        this.ships[existing_ship_index] = existing_ship;
                    } else {
                        var new_ship = this._get_next_available_ship()
                        console.log('new_ship', new_ship, this.ships_available);
                        if (!new_ship) {
                            console.log('all ships placed');
                            this.$emit('ships-placed', this.ships);
                            return;
                        }
                        new_ship.position = cell_name;                        
                        if (this._check_placement_possibility(new_ship, cell_name)) {                            
                            this.ships.push({
                                size: new_ship.size,
                                position: new_ship.position,
                                is_vertical: new_ship.is_vertical
                            });
                            console.log('placed horizontally', this.ships);
                        } else {
                            new_ship.is_vertical = true;
                            if (this._check_placement_possibility(new_ship, cell_name)) {
                                this.ships.push({
                                    size: new_ship.size,
                                    position: new_ship.position,
                                    is_vertical: new_ship.is_vertical
                                });
                                console.log('placed vertically', this.ships);
                            }
                        }
                    }
                    console.log('_handle_ship_placement_click out');
                },

                _check_placement_possibility: function (ship, cell_name) {
                    var row = cell_name.charCodeAt(0) - 'a'.charCodeAt(0);
                    var col = parseInt(cell_name.slice(1)) - 1;
                    ship.position = cell_name;
                    console.log('_check_placement_possibility', row, col, ship.size);
                    
                    // can't position next to grid walls
                    if (row == 0 || col == 0 || row == 9 || col == 9) {
                        console.log('_check_placement_possibility: can\'t position next to grid walls');
                        return false;
                    }
                    
                    // can't position if not fitting into grid cols / rows
                    if (!ship.is_vertical && col + ship.size > 9) {
                        console.log('_check_placement_possibility: can\'t position if not fitting into grid cols');
                        return false;
                    }
                    if (ship.is_vertical && row + ship.size > 9) {
                        console.log('_check_placement_possibility: can\'t position if not fitting into grid rows');
                        return false;
                    }

                    // can't intersect with other ships
                    for (i in this.ships) {
                        var other_ship = this.ships[i];                        
                        var other_ship_row = other_ship.position.charCodeAt(0) - 'a'.charCodeAt(0);
                        var other_ship_col = parseInt(other_ship.position.slice(1)) - 1;
                        
                        console.log('- checking intersection with', other_ship_row, other_ship_col, other_ship.size);
                        
                        if (other_ship.position == cell_name && other_ship.size == ship.size ) {
                            // TODO: better same-ship identification
                            console.log('   identificated as the same ship, skipping');
                            continue;
                        }
                        if (ship.is_vertical) {
                            if (other_ship.is_vertical) {
                                console.log('   both vertical');
                                if (this._check_ships_overlap_or_touch(ship, other_ship)) {
                                    return false;
                                }
                            } else {
                                console.log('   maybe crossing');
                                if (this._check_ships_cross_or_touch(ship, other_ship)) {
                                    return false;
                                }
                            }
                        } else {
                            if (!other_ship.is_vertical) {
                                console.log('   both horizontal');
                                if (this._check_ships_overlap_or_touch(ship, other_ship)) {
                                    return false;
                                }
                            } else {
                                console.log('   maybe crossing');
                                if (this._check_ships_cross_or_touch(ship, other_ship)) {
                                    return false;
                                }
                            }
                        }
                    }
                    return true;
                },

                _check_ships_overlap_or_touch: function (ship1, ship2) {
                    if (ship1.is_vertical) {                        
                        // if both ships are vertical, they can't overlap if not sharing the same/adjacent columns
                        var ship1_col = parseInt(ship1.position.slice(1)) - 1;
                        var ship2_col = parseInt(ship2.position.slice(1)) - 1;
                        console.log(' * both vertical', ship1_col, ship2_col, Math.abs(ship1_col-ship2_col))
                        if (Math.abs(ship1_col-ship2_col) > 1) {
                            console.log(' -> not sharing nor touching the column, leaving');
                            return false;
                        }
                        var min_ship = this._min_row_ship(ship1, ship2)
                        var max_ship = this._max_row_ship(ship1, ship2)
                        var min_ship_row = min_ship.position.charCodeAt(0) - 'a'.charCodeAt(0);
                        var max_ship_row = max_ship.position.charCodeAt(0) - 'a'.charCodeAt(0);
                        console.log(' : ', min_ship_row, min_ship_row + min_ship.size, max_ship_row);
                        console.log(' -> ', min_ship_row + min_ship.size >= max_ship_row);
                        return min_ship_row + min_ship.size >= max_ship_row;
                    } else {
                        // if both ships are horizontal, they can't overlap if not sharing the same/adjacent raws
                        var ship1_row = ship1.position.charCodeAt(0) - 'a'.charCodeAt(0);
                        var ship2_row = ship2.position.charCodeAt(0) - 'a'.charCodeAt(0);
                        console.log(' * both horizontal', ship1_row, ship2_row, Math.abs(ship1_row-ship2_row))
                        if (Math.abs(ship1_row - ship2_row) > 1) {
                            console.log(' -> not sharing nor touching the row, leaving');
                            return false;
                        }
                        var min_ship = this._min_col_ship(ship1, ship2)
                        var max_ship = this._max_col_ship(ship1, ship2)
                        var min_ship_col = parseInt(min_ship.position.slice(1)) - 1;
                        var max_ship_col = parseInt(max_ship.position.slice(1)) - 1;
                        console.log(' : ', min_ship_col, min_ship_col + min_ship.size, max_ship_col);
                        console.log(' -> ', min_ship_col + min_ship.size >= max_ship_col);
                        return min_ship_col + min_ship.size >= max_ship_col;
                    }
                },

                _check_ships_cross_or_touch: function (ship1, ship2) {
                    if (ship1.is_vertical) {
                        var ship1_row = ship1.position.charCodeAt(0) - 'a'.charCodeAt(0);
                        var ship2_row = ship2.position.charCodeAt(0) - 'a'.charCodeAt(0);
                        var ship1_col = parseInt(ship1.position.slice(1)) - 1;
                        var ship2_col = parseInt(ship2.position.slice(1)) - 1;
                        return (ship1_row <= ship2_row) && (ship2_row <= ship1_row + ship1.size) &&
                               (ship2_col <= ship1_col) && (ship1_col <= ship2_col + ship2.size);
                    } else {
                        return this._check_ships_cross_or_touch(ship2, ship1);
                    }
                },

                _max_row_ship: function (ship1, ship2) {
                    var row1 = ship1.position.charCodeAt(0) - 'a'.charCodeAt(0);
                    var row2 = ship2.position.charCodeAt(0) - 'a'.charCodeAt(0);
                    return row1 > row2 ? ship1 : ship2;
                },

                _min_row_ship: function (ship1, ship2) {
                    var row1 = ship1.position.charCodeAt(0) - 'a'.charCodeAt(0);
                    var row2 = ship2.position.charCodeAt(0) - 'a'.charCodeAt(0);
                    return row1 < row2 ? ship1 : ship2;
                },

                _max_col_ship: function (ship1, ship2) {
                    var col1 = parseInt(ship1.position.slice(1)) - 1;
                    var col2 = parseInt(ship2.position.slice(1)) - 1;
                    return col1 > col2 ? ship1 : ship2;
                },

                _min_col_ship: function (ship1, ship2) {
                    var col1 = parseInt(ship1.position.slice(1)) - 1;
                    var col2 = parseInt(ship2.position.slice(1)) - 1;
                    return col1 < col2 ? ship1 : ship2;
                },

                _handle_my_shot: function (cell_name) {
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
                    var hit_confirmed = confirm(
                        `Is your opponent familiar with the forms of the verb ${this.word_for_cell(cell_name)}?`);
                    this.$emit('shot', cell_name, hit_confirmed ? 'damaged' : 'aimed');
                },

                _handle_enemy_shot: function (cell_name) {
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
                    return !!this._get_ship(cell_name);
                },

                _get_ship: function (cell_name) {
                    // the task is small, so we can afford to use simple brute force approach
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
                                return [i, ship];
                            }
                        } else { // horizontal                            
                            var diff = col - ship_col;
                            if (ship_row == row && diff < ship.size && diff >= 0) {
                                return [i, ship];
                            }                            
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