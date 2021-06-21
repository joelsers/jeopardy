

//saving api url for easy access later
const apiUrl = 'https://jservice.io/api/'
//using number of categories for iteration later
const categories_across = 6
//using number of questions for iteration later
const questions_down = 5
//saving our api data in categories as an array of objects
let categories = [];

//get 100 random categories and create an array of 6 for later
async function getCategoryIds() {
    const response = await axios.get(`${apiUrl}categories?count=100`)
    const categoryIds = response.data.map(x => x.id);
    return _.sampleSize(categoryIds, categories_across)

}
//by the category ID we store out questions and answers into objects that we put into our categories array later
async function getCategory(catId) {
    let response = await axios.get(`${apiUrl}category?id=${catId}`)

    let category = response.data
    let allClues = category.clues
    let randClues = _.sampleSize(allClues, questions_down);
    let clues = randClues.map(x => ({
        question: x.question,
        answer: x.answer,
        showing: null
    }));
    return { title: category.title, clues };
}
//create our table, assign category text, and assign IDs for the event listeners.
async function fillTable() {
    $("#jeopardy thead").empty();
    let $tr = $('<tr>')
    for (let cati = 0; cati < categories_across; cati++) {
        $tr.append($('<th>').text(categories[cati].title));

    }
    $('#jeopardy thead').append($tr);

    $("#jeopardy tbody").empty();
    for (let cluei = 0; cluei < questions_down; cluei++) {

        let $tr = $('<tr>');
        for (let cati = 0; cati < categories_across; cati++) {
            $tr.append($('<td>').attr('id', `${cati}-${cluei}`).text('?'))
        }
        $('#jeopardy tbody').append($tr);
    }

}
// create event listener to click question marks that become questions and then answers based on IDs

function handleClick(evt) {
    let id = evt.target.id;
    let [cati, cluei] = id.split('-');
    let clue = categories[cati].clues[cluei];

    let msg

    if (!clue.showing) {
        msg = clue.question;
        clue.showing = "question";
    } else if (clue.showing === "question") {
        msg = clue.answer;
        clue.showing = "answer";
    } else {
        return
    }

    $(`#${cati}-${cluei}`).html(msg);
}
//creates a loading spinner.
function showLoadingView() {
    $('body').append($('<div>').attr('class', 'loader'))
}
//hides the loading spinner
function hideLoadingView() {
    $('.loader').remove()
}
//runs the game and resets the game if we want to reset.
//assigns the even listener to the game board and event listener to the reset button
async function setupAndStart() {
    showLoadingView();
    $('tr').remove()
    $('thead').remove()
    $('tbody').remove()
    $('th').remove()
    $('td').remove()
    $('#button').remove()
    $('body').prepend($('<button>').attr('id', 'button').text('Reset Board'))
    $('body').prepend($('<table>').attr('id', 'jeopardy').prepend($('<thead>').attr('id', 'jeopardy thead')))
    $('#jeopardy').append($('<tbody>').attr('id', 'jeopardy tbody'))
    $("#jeopardy").on("click", "td", handleClick)
    $('button').on("click", setupAndStart)
    let catIds = await getCategoryIds();

    categories = [];

    for (let cati of catIds) {
        categories.push(await getCategory(cati));
    }
    hideLoadingView();
    fillTable();

}
//calling it to get the game going.
setupAndStart();
