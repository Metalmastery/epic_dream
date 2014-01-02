self.addEventListener('message', function(e) {
//    var data = JSON.parse(e.data);
    var i = 1000000000,
        sum = 0;
    while (i){
        i--;
        sum += Math.random();
    }
    self.postMessage({data : e.data.data, sum : sum});
});