// fetch("/get-user-required-data", {
//   method: "GET",
//   headers: {
//     session: sessionStorage
//   }
// })
//   .then(result => {
//     return result.json();
//   })
//   .then(data => {
//     console.log(data);
//   })
//   .catch(err => {
//     // console.log(err);
//   });

fetch("/index-data-set", {
  method: "GET"
})
  .then(result => {
    return result.json();
  })
  .then(value => {
    console.log(value[0]["A+"]);
    var chart = new CanvasJS.Chart("chartContainer", {
      theme: "dark1",
      animationEnabled: true,
      title: {
        text: "Chart of number of blood donors according to blood group"
      },
      data: [
        {
          type: "bar",
          dataPoints: [
            { label: "A+", y: value[0]["A+"] },
            { label: "A-", y: value[1]["A-"] },
            { label: "B+", y: value[2]["B+"] },
            { label: "B-", y: value[3]["B-"] },
            { label: "O+", y: value[4]["O+"] },
            { label: "O-", y: value[5]["O-"] },
            { label: "AB+", y: value[6]["AB+"] },
            { label: "AB-", y: value[7]["AB-"] }
          ]
        }
      ]
    });
    chart.render();
  });
