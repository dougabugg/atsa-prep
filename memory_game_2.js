let cfg_form = document.forms.cfg;

let cfg = {};
let state = {};
let section_name = document.querySelector("#section-name");
let primary_output = document.querySelector("#primary-output");
let secondary_output = document.querySelector("#secondary-output");
let feedback_output = document.querySelector("#feedback-output");

function load_cfg() {
    cfg.rounds = Math.round(cfg_form.rounds.value);
    cfg.timer = Number(cfg_form.timer.value) * 1000;
    cfg.section = Number(cfg_form.section.value);
}

function get_random_number() {
    let min = 1;
    let max = 9;
    return Math.floor(Math.random() * (max - min + 1) + min);
}

function get_random_order() {
    let orderings = [
        ["A", "B", "C"],
        ["A", "C", "B"],
        ["C", "A", "B"],
        ["C", "B", "A"],
        ["B", "A", "C"],
        ["B", "C", "A"]
    ];
    return orderings[Math.floor(Math.random() * orderings.length)];
}

function reset_feedback() {
    feedback_output.classList.remove("correct-answer");
    feedback_output.classList.remove("wrong-answer");
    feedback_output.textContent = "";
}

function start_section_1() {
    state.section = 1;
    section_name.textContent = "First Section"
    state.round = 0;
    let vars, order_show, order_input, index;
    function new_round() {
        state.round++;
        state.step = show_step;
        vars = {};
        vars.A = get_random_number();
        vars.B = get_random_number();
        vars.C = get_random_number();
        order_show = get_random_order();
        order_input = get_random_order();
        index = 0;
    }

    function show_step() {
        reset_feedback();
        primary_output.textContent = order_show[index] + " =";
        secondary_output.classList.remove("user-input");
        secondary_output.textContent = vars[order_show[index]];
        index++;
        if(index == 3) {
            index = 0;
            state.step = input_step;
        }
        state.timeoutID = setTimeout(state.step, cfg.timer);
    }
    

    function input_step() {
        reset_feedback();
        primary_output.textContent = order_input[index] + " =";
        secondary_output.classList.add("user-input");
        secondary_output.textContent = "?";
        state.waiting = true;
    }

    state.check = function(input) {
        let letter = order_input[index];
        state.question_tally++;
        if(vars[letter] == input) {
            feedback_output.classList.add("correct-answer");
            feedback_output.textContent = "Correct answer";
            state.correct_tally++;
        } else {
            feedback_output.classList.add("wrong-answer");
            feedback_output.textContent = "Wrong answer";
        }
        index++;
        if(index == 3) {
            new_round();
            if(state.round == state.max_rounds) {
                finish_section();
                return;
            }
        }
        state.timeoutID = setTimeout(state.step, cfg.timer);
    }

    new_round();
    show_step();
}

function start_section_2() {
    state.section = 2;
}

function start_section_3() {
    state.section = 3;
}

function finish_section() {
    if(cfg.section == 4) {
        if(state.section == 1) {
            start_section_2();
            return;
        } else if(state.section == 2) {
            start_section_3();
            return;
        }
    }
    stop_game();
}

function start_game() {
    if(state.game_running)
        return;
    state.game_running = true;
    load_cfg();
    reset_feedback();
    state.max_rounds = cfg.rounds;
    state.correct_tally = 0;
    state.question_tally = 0;
    if(cfg.section == 2) {
        start_section_2();
    } else if(cfg.section == 3) {
        start_section_3();
    } else {
        start_section_1();
    }
}

function stop_game() {
    state.game_running = false;
    section_name.innerHTML = "&nbsp;";
    primary_output.innerHTML = "&nbsp;";
    secondary_output.classList.remove("user-input");
    secondary_output.textContent = "";
    reset_feedback();
    clearTimeout(state.timeoutID);
    delete state.timeoutID;
    if(state.question_tally > 0) {
        let p = Math.round((state.correct_tally / state.question_tally) * 100);
        feedback_output.textContent = `Answered ${p}% (${state.correct_tally}/${state.question_tally}) correct`;
    }
}

function key_down_event(e) {
    if(!state.waiting)
        return;
    state.waiting = false;
    // console.log({event: e, key: e.key, location: (["standard", "left", "right", "numpad"])[e.location]});
    let c = e.key.charCodeAt(0);
    if(c < 48 || c > 57)
        return;
    secondary_output.textContent = e.key;
    state.check(Number(e.key));
}

document.querySelector("#start-game").addEventListener("click", start_game);
document.querySelector("#stop-game").addEventListener("click", stop_game);
document.addEventListener("keydown", key_down_event);
