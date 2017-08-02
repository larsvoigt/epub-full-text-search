/**
 * Created by larsvoigt on 21.07.17.
 */
const host = window.location.origin;

var uuid;
var epub;

$("#searchControl").find('*').attr('disabled', true);
$('#readium1').attr('src', host + '/readium');

$('iframe').on('load', () => {

    const contentWindow = $('#readium1')[0].contentWindow;

    // indexing
    contentWindow.$(contentWindow).on('readepub', (e, eventPayload) => {

        if(epub === eventPayload.epub)
            return;

        epub = eventPayload.epub;
        console.log('readepub: ' + epub);
        uuid = generateUUID();
        const req = host + `/addToIndex?url=${epub}/&uuid=${uuid}`;
        console.log('req: ' + req);

        $('#search1').button('loading');
        // index on the fly
        $.ajax({url: req, method: "GET"})
            .done(response => {

                $("#searchControl").find('*').attr('disabled', false);
                $('#search1').button('reset');
                console.log("response indexing: " + response);
            })
            .fail((jqXHR, textStatus, errorThrown) => {
                    bootstrapAlert.error(jqXHR.responseText);
                }
            );
    });

    // deleting
    contentWindow.$(contentWindow).on('loadlibrary', (e, eventPayload) => {

        console.log('loadlibrary');
        $("#searchControl").find('*').attr('disabled', true);
        $("#results").empty();
        const req = host + `/deleteFromIndex?&uuid=${uuid}`;
        console.log('req: ' + req);

        $.ajax({url: req, method: "GET"})
            .done(response => {

                console.log("response deleting: " + response);
            })
            .fail((jqXHR, textStatus, errorThrown) => {
                    bootstrapAlert.error(jqXHR.responseText);
                }
            );
    });
});


function search() {

    $("#hits").empty();
    $('#search').button('loading');

    const term = $("#searchbox").val();

    if (term === "") {
        bootstrapAlert.error("Add search term ;-)");
        $('#search').button('reset');
        return;
    }


    const request = host + '/search?q=' + $("#searchbox").val();// + '&t=' + epubTitle;
    $.getJSON(request, '', {})
        .done(hits => {

            $('#search').button('reset');

            if (hits.length > 0) {
//                        console.log("found " + hits.length + ' hits');

                $('#hitsCount').text(hits.length + "." + ' hits');
                for (var index in hits)
                    $("#hits").append($("<li class='list-group-item'>").html((++index) + ". <pre>" + syntaxHighlight(JSON.stringify(hits[index], undefined, 2)) + "</pre>"));

            } else {

                $("#hits").append($("<li>").html("<li class='list-group-item'>No Hits </li>"));
            }
            console.debug("search request ready");
        })
        .fail((d, textStatus, error) => {

            $('#search').button('reset');
            const err = d.status + " " + error + " -> message: " + d.responseText;
            bootstrapAlert.error(err);
            console.error(`Search request failed: \n ${err}`);
        });
}

// looking for suggestions
function instantSearch() {

    const q = $("#searchbox").val();
    if (q === '')
        return;

    const matcher = "/matcher?beginsWith=" + q;
    const request = host + matcher;

    console.debug(request);

    $.getJSON(request, '', {})
        .done(data => {

            $("#searchbox").autocomplete({
                source: data,
                select: (event) => {
                    event.stopPropagation();
                    $("#search").trigger("click");
                }
            });
        })
        .fail((d, textStatus, error) => {

            const err = d.status + " " + error + " -> message: " + d.responseText;
            bootstrapAlert.error(err);
            console.error(`Search request failed: \n ${err}`);
        });
}

function searchReadium() {

    $("#results").empty();
    $('#search1').button('loading');

    const term = $("#searchbox1").val();

    if (term === "") {
        bootstrapAlert.error("Add search term ;-)");
        $('#search1').button('reset');
        return;
    }

    const request = host + `/search?q=${term}&uuid=${uuid}`;
    $.getJSON(request, '', {})
        .done(hits => {

            $('#search1').button('reset');

            if (hits.length > 0) {

                for (var i in hits) {
                    const href = hits[i].href;
                    const $href = $(`<li class="list-group-item"> spine item:  ${href} </li>`);
                    const $cfis = $(`<ul class="list-group"></ul>`);

                    for (var ii in hits[i].cfis) {

                        const excerpt = hits[i].cfis[ii].excerpt.replace(new RegExp("(" + term + ")", "gi"), '<b>$1</b>');
                        const idref = hits[i].id;
                        const elementcfi = hits[i].cfis[ii].cfi.split('!')[1];
                        const goto = `&goto={"idref" : "${idref}", "elementCfi" : "${elementcfi}"}`;
                        const reqGoto = host + `/readium/?epub=${epub}${goto}`;

                        var entry = `<li class="list-group-item list-group-item-warning">`;
                        entry += `<a data-toggle="tooltip" title=${elementcfi} goto='${reqGoto}' href="#">${excerpt}</a>`;
                        // entry += `<a data-toggle="tooltip" title=${elementcfi} href='${reqGoto}' >${goto}</a>`;
                        entry += `</li>`;
                        $cfis.append(entry);
                    }
                    $href.append($cfis);
                    $("#results").append($href);
                }
                $('[data-toggle="tooltip"]').tooltip();

                $('a').click(openCFI); // Is it tricky to add listener to any link element?
            } else
                $("#results").append($("<li>").html("<li>No Hits </li>"));

            console.log("search request ready");
        })
        .fail((d, textStatus, error) => {

            $('#search').button('reset');
            const err = d.status + " " + error + " -> message: " + d.responseText;
            bootstrapAlert.error(err);
        });
}


// todo: refactoring overload instantSearch()
function instantSearchReadium() {

    const q = $("#searchbox1").val();
    if (q === '')
        return;

    const matcher = `/matcher?beginsWith=${q}&uuid=${uuid}`;
    const request = host + matcher;

    console.debug(request);

    $.getJSON(request, '', {})
        .done(data => {

            $("#searchbox1").autocomplete({
                source: data,
                select: (event) => {
                    event.stopPropagation();
                    $("#search1").trigger("click");
                }
            });
        })
        .fail((d, textStatus, error) => {

            const err = d.status + " " + error + " -> message: " + d.responseText;
            bootstrapAlert.error(err);
            console.error(`Search request failed: \n ${err}`);
        });
}


function openCFI(){
    // const contentWindow = $('#readium1')[0].contentWindow;
    // const readium = contentWindow.Readium;

    $('#readium1').attr('src', $(this).attr('goto'));
}


function addEventHandler() {

    $("#search").click(search);
    $("#searchbox").keyup((event) => {

        if (event.which === 13)
            return;

        instantSearch();
        event.stopPropagation();
    });

    $("#search1").click(searchReadium);
    $("#searchbox1").keyup((event) => {

        if (event.which === 13)
            return;

        instantSearchReadium();
        event.stopPropagation();
    });
}
window.onload = addEventHandler;


function syntaxHighlight(json) {

    if (!json) return;
    json = json.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    return json.replace(/("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g, (match) => {
        var cls = 'number';
        if (/^"/.test(match)) {
            if (/:$/.test(match)) {
                cls = 'key';
            } else {
                cls = 'string';
            }
        } else if (/true|false/.test(match)) {
            cls = 'boolean';
        } else if (/null/.test(match)) {
            cls = 'null';
        }
        return '<span class="' + cls + '">' + match + '</span>';
    });
}

function generateUUID() {
    var d = new Date().getTime();
    var uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        var r = (d + Math.random() * 16) % 16 | 0;
        d = Math.floor(d / 16);
        return (c == 'x' ? r : (r & 0x3 | 0x8)).toString(16);
    });
    return uuid;
};

function triggerContentIsLoaded(readium) {
    console.log('ContentIsLoaded');
}
const bootstrapAlert = function () {
};

bootstrapAlert.error = function (message) {
    $('#alert_placeholder').html('<div class="alert alert-danger alert-dismissable">' +
        '<button type="button" class="close" data-dismiss="alert" aria-hidden="true">&times;</button>' +
        '<span>' + message + '</span>' +
        '</div>')
};