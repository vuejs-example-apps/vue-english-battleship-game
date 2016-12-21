var Grid = Vue.component('Grid', function (resolve, reject) {
    ajax.get("/components/Grid.tpl.html", function (template_string) {
        resolve({
            template: template_string,
            props: ['name', 'words', 'mode'],
        });    
    });
});