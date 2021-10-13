let cfg_form = document.forms.cfg;

let cfg = {};
let state = {};
let primary_output = document.querySelector("#primary-output");
let feedback_output = document.querySelector("#feedback-output");

function load_cfg() {
    cfg.rounds = Math.round(cfg_form.rounds.value);
    cfg.timer = Number(cfg_form.timer.value) * 1000;
}

function get_random_number() {
    let min = 1;
    let max = 9;
    return Math.floor(Math.random() * (max - min + 1) + min);
}

function reset_feedback() {
    feedback_output.classList.remove("correct-answer");
    feedback_output.classList.remove("wrong-answer");
    feedback_output.textContent = "";
}

function next_round() {
    state.round += 1;
    if(state.round == state.max_rounds) {
        stop_game();
        return;
    }
    reset_feedback();
    primary_output.classList.remove("user-input");
    primary_output.textContent = state.value_b;
    state.timeoutID = setTimeout(await_input, cfg.timer);
}

function await_input() {
    state.waiting = true;
    primary_output.classList.add("user-input");
    primary_output.textContent = "?";
}

function start_game() {
    if(state.running)
        return;
    load_cfg();
    state.max_rounds = cfg.rounds + 1;
    state.round = 0;
    state.correct_tally = 0;
    state.value_a = get_random_number();
    do {
        state.value_b = get_random_number();
    } while(state.value_a == state.value_b)
    state.running = true;
    state.waiting = false;
    reset_feedback();
    primary_output.textContent = state.value_a;
    state.timeoutID = setTimeout(next_round, cfg.timer);
}

function stop_game() {
    state.running = false;
    primary_output.classList.remove("user-input");
    primary_output.textContent = "--";
    reset_feedback();
    if(state.round > 1) {
        let p = Math.round((state.correct_tally / (state.round-1)) * 100);
        feedback_output.textContent = `Answered ${p}% (${state.correct_tally}/${state.round-1}) correct`;
    }
    clearTimeout(state.timeoutID);
    state = {};
}

function key_down_event(e) {
    if(!state.waiting)
        return;
    // console.log({event: e, key: e.key, location: (["standard", "left", "right", "numpad"])[e.location]});
    let c = e.key.charCodeAt(0);
    if(c < 48 || c > 57)
        return;
    primary_output.textContent = e.key;
    let input = Number(e.key);
    let answer = Math.abs(state.value_a - state.value_b);
    if(input == answer) {
        feedback_output.classList.add("correct-answer");
        feedback_output.textContent = "Correct answer";
        state.correct_tally++;
    } else {
        feedback_output.classList.add("wrong-answer");
        feedback_output.textContent = "Wrong answer";
    }
    state.value_a = state.value_b;
    state.value_b = get_random_number();
    state.waiting = false;
    state.timeoutID = setTimeout(next_round, cfg.timer);
}

document.querySelector("#start-game").addEventListener("click", start_game);
document.querySelector("#stop-game").addEventListener("click", stop_game);
document.addEventListener("keydown", key_down_event);
