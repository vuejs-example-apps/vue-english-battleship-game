var App = Vue.component('Game', function (resolve, reject) {
    ajax.get("/components/Game.tpl.html", function (template_string) {
        ajax.getJSON("/game_initial_state.json", function (game_initial_state) {        
            resolve({
                template: template_string,
                data: function () { return game_initial_state; },
                methods: {
                    choose_grid: function (grid_name) {
                        if (! grid_name in this.grids) {
                            console.log('wrong grid choice', grid_name);
                            return;
                        }
                        this.chosen_grid.name = grid_name;
                        this.chosen_grid.words = this.grids[grid_name];
                        this.grid_chosen = true;
                    },
                    reset_grid_choice: function () {
                        this.chosen_grid.name = '';
                        this.chosen_grid.words = [];
                        this.grid_chosen = false;
                    },
                    shoot_enemy: function (cell_name, result) {
                        this.my_shots[cell_name] = result;
                        this.my_turn = !this.my_turn;
                    },
                    take_a_shot: function (cell_name, result) {
                        this.enemy_shots[cell_name] = result;
                        this.my_turn = !this.my_turn;
                    },
                    handle_ships_placed: function (ships) {
                        this.my_ships = ships;
                        this.my_ships_placed = true;
                    }
                }
            })
        });    
    });
});