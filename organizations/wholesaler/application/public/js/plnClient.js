/**
** O'Reilly - Accelerated Hands-on Smart Contract Development with Hyperledger Fabric V2
** farma ledger supply chain network
** JS for wholesaler web appication
**/
$(document).ready(function(){
     //make sure change to your own machine ip or dmain url
    var urlBase = "http://localhost:30001";
     var tabs =["addToWallet", "wholesalerDistribute", "query", "queryHistory"];
     $("#queryResult").hide();
     $("#queryResultEmpty").hide();
     $("#queryHistoryResult").hide();
     $("#queryHistoryResultEmpty").hide();
     $("#addToWalletLink").click(function(){
       showTab("addToWallet");
     });
   $("#wholesalerDistributeLink").click(function(){
     showTab("wholesalerDistribute");
   });
   $("#queryLink").click(function(){
       showTab("query");
   });
   $("#queryHistoryLink").click(function(){
       showTab("queryHistory");
   });
 $("#addUser").click(function(e){
   e.preventDefault();
   var addUserUrl = urlBase+"/addUser";
   var userName = $('#user').val();
   
   if (!userName || userName.trim() === '') {
     showToast("Please enter a username", "error");
     return;
   }
   
   showLoadingSpinner();
   
   $.ajax({
     type: 'POST',
     url: addUserUrl,
     data: { userName: userName },
     success: function(data, status, jqXHR){
       hideLoadingSpinner();
       console.log("Success response:", data);
       if(status==='success'){
         let message = data.message || data;
         showToast("User " + userName + " was successfully added to wallet", "success");
         showTab("wholesalerDistribute");
       }
     },
     error: function(xhr, textStatus, error){
         hideLoadingSpinner();
         console.log("Error status:", xhr.statusText);
         console.log("Error textStatus:", textStatus);
         console.log("Error details:", error);
         console.log("Error response:", xhr.responseText);
         
         try {
           let errorObj = JSON.parse(xhr.responseText);
           if (errorObj.message) {
             showToast("Error: " + errorObj.message, "error");
           } else if (errorObj.status && errorObj.error) {
             showToast("Error: " + errorObj.error, "error");
           } else {
             showToast("Error: " + xhr.responseText, "error");
           }
         } catch (e) {
           showToast("Error: " + xhr.responseText, "error");
         }
     }
   });
 });
 $("#wholesalerDistribute").click(function(e){
   e.preventDefault();
   var wholesalerDistributeUrl = urlBase+"/wholesalerDistribute";
   var equipmentNumber = $('#equipmentNumber').val();
   var ownerName = $('#ownerName').val();
   
   // Validate fields
   if (!equipmentNumber || !ownerName) {
     showToast("Both equipment number and owner name are required", "error");
     return;
   }
   
   var formData = {
     equipmentNumber: equipmentNumber,
     ownerName: ownerName
   }
   
   showLoadingSpinner();
   
   $.ajax({
     type: 'POST',
     url: wholesalerDistributeUrl,
     data: formData,
     success: function(data, status, jqXHR){
       hideLoadingSpinner();
       if(status==='success'){
         showToast("Equipment distribution recorded in blockchain successfully", "success");
         // Pre-fill the query field with the equipment number for convenience
         $('#queryKey').val(equipmentNumber);
         showTab("query");
      }
     },
     error: function(xhr, textStatus, error){
         hideLoadingSpinner();
         console.log("Error status:", xhr.statusText);
         console.log("Error textStatus:", textStatus);
         console.log("Error details:", error);
         console.log("Error response:", xhr.responseText);
         
         try {
           let errorObj = JSON.parse(xhr.responseText);
           if (errorObj.message) {
             showToast("Error: " + errorObj.message, "error");
           } else if (errorObj.status && errorObj.error) {
             showToast("Error: " + errorObj.error, "error");
           } else {
             showToast("Error: " + xhr.responseText, "error");
           }
         } catch (e) {
           showToast("Error: " + xhr.responseText, "error");
         }
     }
   });
 });
$("#query").click(function(e){
 e.preventDefault();
 reset();
 var queryUrl = urlBase+"/queryByKey";
 var searchKey = $('#queryKey').val();
 
 if (!searchKey || searchKey.trim() === '') {
   showToast("Please enter a key to query", "error");
   return;
 }

 showLoadingSpinner();
 
 $.ajax({
   type: 'GET',
   url: queryUrl,
   data: { key: searchKey },
   success: function(data, status, jqXHR){
     hideLoadingSpinner();
     if(!data || !data.Record || !data.Record.equipmentNumber) {
       $("#queryResultEmpty").show();
       $("#queryResult").hide();
       showToast("No record found for key: " + searchKey, "warning");
     } else {
       $("#queryResult").show();
       $("#queryResultEmpty").hide();
       let record = data.Record;
       $("#equipmentNumberOutPut").text(record.equipmentNumber);
       $("#equipmentNameOutPut").text(record.equipmentName);
       $("#manufacturerOutPut").text(record.manufacturer);
       $("#ownerNameOutPut").text(record.ownerName);
       $("#createDateTime").text(record.createDateTime);
       $("#lastUpdated").text(record.lastUpdated);
       $("#queryKeyRequest").text(data.Key);
       $("#previousOwnerType").text(record.previousOwnerType);
       $("#currentOwnerType").text(record.currentOwnerType);
       showToast("Query successful", "success");
     }
   },
   error: function(xhr, textStatus, error){
       hideLoadingSpinner();
       console.log("Error status:", xhr.statusText);
       console.log("Error textStatus:", textStatus);
       console.log("Error details:", error);
       console.log("Error response:", xhr.responseText);
       
       try {
         let errorObj = JSON.parse(xhr.responseText);
         if (errorObj.message) {
           showToast("Error: " + errorObj.message, "error");
         } else if (errorObj.status && errorObj.error) {
           showToast("Error: " + errorObj.error, "error");
         } else {
           showToast("Error: " + xhr.responseText, "error");
         }
       } catch (e) {
         showToast("Error: " + xhr.responseText, "error");
       }
   }
 });
});
$("#queryHistory").click(function(e){
  e.preventDefault();
  reset();
  var queryUrl = urlBase+"/queryHistoryByKey";
  var searchKey = $('#queryHistoryKey').val();
  
  if (!searchKey || searchKey.trim() === '') {
    showToast("Please enter a key to query history", "error");
    return;
  }

  showLoadingSpinner();
  
  $.ajax({
    type: 'GET',
    url: queryUrl,
    data: { key: searchKey },
    success: function(data, status, jqXHR){
      hideLoadingSpinner();
      if(!data || data.length==0) {
        $("#queryHistoryResultEmpty").show();
        $("#queryHistoryResult").hide();
        showToast("No history records found for key: " + searchKey, "warning");
      } else {
        $("#queryHistoryResult").show();
        $("#queryHistoryResultEmpty").hide();
        console.log(data);
        $("#historyTableTboday").empty();
        var tbody = $("#historyTableTboday");
        for (var i = 0; i < data.length; i++) {
            var row = data[i];
            var tr = '<tr>';
            tr = tr+'<td>'+ row.equipmentNumber + '</td>';
            tr = tr+ '<td>'+ row.manufacturer + '</td>';
            tr = tr+ '<td>'+ row.equipmentNumber + '</td>';
            tr = tr+ '<td>'+ row.equipmentName + '</td>';
            tr = tr+ '<td>'+ row.ownerName + '</td>';
            tr = tr+ '<td>'+ row.previousOwnerType + '</td>';
            tr = tr+ '<td>'+ row.currentOwnerType + '</td>';
            tr = tr+ '<td>'+ row.createDateTime + '</td>';
            tr = tr+ '<td>'+ row.lastUpdated + '</td>';
            tr = tr+ '</tr>';
            tbody.append(tr);
        }
        showToast("Query history successful: " + data.length + " records found", "success");
      }
    },
    error: function(xhr, textStatus, error){
        hideLoadingSpinner();
        console.log("Error status:", xhr.statusText);
        console.log("Error textStatus:", textStatus);
        console.log("Error details:", error);
        console.log("Error response:", xhr.responseText);
        
        try {
          let errorObj = JSON.parse(xhr.responseText);
          if (errorObj.message) {
            showToast("Error: " + errorObj.message, "error");
          } else if (errorObj.status && errorObj.error) {
            showToast("Error: " + errorObj.error, "error");
          } else {
            showToast("Error: " + xhr.responseText, "error");
          }
        } catch (e) {
          showToast("Error: " + xhr.responseText, "error");
        }
    }
  });
});
function showTab(which) {
   for(let i in tabs) {
     if(tabs[i]===which) {
       $("#"+tabs[i] + "Tab").show();
     } else {
       $("#"+tabs[i] + "Tab").hide();
     }
   }
   reset();
   // Highlight active sidebar item
   $('.nav-menu').removeClass('active');
   $('#' + which + 'Link').addClass('active');
}
function reset() {
   $("#queryResultEmpty").hide();
   $("#queryResult").hide();
   $("#queryHistoryResultEmpty").hide();
   $("#queryHistoryResult").hide();
}
});
$(document).ajaxStart(function(){
  $("#wait").css("display", "block");
});
$(document).ajaxComplete(function(){
  $("#wait").css("display", "none");
});

// Show/hide loading spinner
function showLoadingSpinner() {
  $("#wait").show();
}

function hideLoadingSpinner() {
  $("#wait").hide();
}

// Toast notification function
function showToast(message, type) {
  // Type can be 'success', 'error', 'warning'
  var bgColor, textColor, icon;
  
  switch(type) {
    case 'success':
      bgColor = 'bg-success';
      textColor = 'text-white';
      icon = 'check_circle';
      break;
    case 'error':
      bgColor = 'bg-danger';
      textColor = 'text-white';
      icon = 'error';
      break;
    case 'warning':
      bgColor = 'bg-warning';
      textColor = 'text-dark';
      icon = 'warning';
      break;
    default:
      bgColor = 'bg-info';
      textColor = 'text-white';
      icon = 'info';
  }
  
  var toastId = 'toast-' + Date.now();
  var toastHTML = 
    '<div id="' + toastId + '" class="toast ' + bgColor + ' ' + textColor + '" role="alert" aria-live="assertive" aria-atomic="true" style="min-width: 300px;">' +
      '<div class="toast-header ' + bgColor + ' ' + textColor + '">' +
        '<i class="material-icons mr-2">' + icon + '</i>' +
        '<strong class="mr-auto">Notification</strong>' +
        '<button type="button" class="ml-2 mb-1 close" data-dismiss="toast" aria-label="Close">' +
          '<span aria-hidden="true">&times;</span>' +
        '</button>' +
      '</div>' +
      '<div class="toast-body">' + message + '</div>' +
    '</div>';
  
  $('#toast-container').append(toastHTML);
  $('#' + toastId).toast({delay: 5000, animation: true}).toast('show');
  
  // Remove toast from DOM after it's hidden
  $('#' + toastId).on('hidden.bs.toast', function() {
    $(this).remove();
  });
}
