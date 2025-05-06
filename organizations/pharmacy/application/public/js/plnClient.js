/**
** O'Reilly - Accelerated Hands-on Smart Contract Development with Hyperledger Fabric V2
** farma ledger supply chain network
** JS for pharmacy web application
**/
$(document).ready(function(){
    // Initialize the sidebar toggle
    $("#sidebar-wrapper").addClass("sidebar-toggle");
    
    //make sure change to your own machine ip or dmain url
    var urlBase = "http://localhost:30002";
    //var urlBase = "http://your-ip:30002";
    var tabs =["addToWallet", "pharmacyReceived", "query", "queryHistory"];
    
    $("#queryResult").hide();
    $("#queryResultEmpty").hide();
    $("#queryHistoryResult").hide();
    $("#queryHistoryResultEmpty").hide();
    $("#processingWrapper").hide();
    $("#wait").hide();
    
    // Initially show the first tab
    showTab("addToWallet");
    
    $("#addToWalletLink").click(function(){
       showTab("addToWallet");
     });
   $("#pharmacyReceivedLink").click(function(){
     showTab("pharmacyReceived");
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
          showTab("pharmacyReceived");
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
  
  $("#pharmacyReceived").click(function(e){
    e.preventDefault();
    var pharmacyReceivedUrl = urlBase+"/pharmacyReceived";
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
      url: pharmacyReceivedUrl,
      data: formData,
      success: function(data, status, jqXHR){
        hideLoadingSpinner();
        if(status==='success'){
          showToast("Equipment received and recorded in blockchain successfully", "success");
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
            // Check if it's the identity not found error
            if (errorObj.message.includes("Identity not found in wallet")) {
              showToast("Error: Identity not found in wallet. Please add 'Steve' to the wallet first.", "error");
              // Redirect to the add to wallet tab
              showTab("addToWallet");
              // Pre-fill the user field with Steve
              $('#user').val("Steve");
            } else {
              showToast("Error: " + errorObj.message, "error");
            }
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
    console.log("Making history query request for key:", searchKey);
    
    $.ajax({
      type: 'GET',
      url: queryUrl,
      data: { key: searchKey },
      success: function(data, status, jqXHR){
        hideLoadingSpinner();
        console.log("History query response:", data);
        
        if(!data || data.length==0) {
          $("#queryHistoryResultEmpty").show();
          $("#queryHistoryResult").hide();
          showToast("No history records found for key: " + searchKey, "warning");
        } else {
          $("#queryHistoryResult").show();
          $("#queryHistoryResultEmpty").hide();
          $("#historyTableTboday").empty();
          var tbody = $("#historyTableTboday");
          
          // First ensure we've got an array of records
          let historyRecords = Array.isArray(data) ? data : [data];
          console.log("Processing", historyRecords.length, "history records");
          
          for (var i = 0; i < historyRecords.length; i++) {
            var row = historyRecords[i];
            console.log("Processing row:", row);
            
            // Skip if the row doesn't have expected properties
            if (!row.equipmentNumber) {
              console.warn("Skipping record without equipmentNumber:", row);
              continue;
            }
            
            var tr = '<tr>';
            tr = tr+'<td>'+ (row.equipmentNumber || 'N/A') + '</td>';
            tr = tr+ '<td>'+ (row.manufacturer || 'N/A') + '</td>';
            tr = tr+ '<td>'+ searchKey + '</td>';
            tr = tr+ '<td>'+ (row.equipmentName || 'N/A') + '</td>';
            tr = tr+ '<td>'+ (row.ownerName || 'N/A') + '</td>';
            tr = tr+ '<td>'+ (row.previousOwnerType || 'N/A') + '</td>';
            tr = tr+ '<td>'+ (row.currentOwnerType || 'N/A') + '</td>';
            tr = tr+ '<td>'+ (row.createDateTime || 'N/A') + '</td>';
            tr = tr+ '<td>'+ (row.lastUpdated || 'N/A') + '</td>';
            tr = tr+ '</tr>';
            tbody.append(tr);
          }
          
          if ($("#historyTableTboday tr").length > 0) {
            showToast("Query history successful: " + $("#historyTableTboday tr").length + " records displayed", "success");
          } else {
            $("#queryHistoryResultEmpty").show();
            $("#queryHistoryResult").hide();
            showToast("No valid history records found for key: " + searchKey, "warning");
          }
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
            // Check if it's the identity not found error
            if (errorObj.message.includes("Identity not found in wallet")) {
              showToast("Error: Identity not found in wallet. Please add 'Steve' to the wallet first.", "error");
              // Redirect to the add to wallet tab
              showTab("addToWallet");
              // Pre-fill the user field with Steve
              $('#user').val("Steve");
            } else {
              showToast("Error: " + errorObj.message, "error");
            }
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
    tabs.forEach(function(tab) {
      $('#' + tab + 'Tab').hide();
      $('#' + tab + 'Link').parent().removeClass("active");
    });
    $('#' + which + 'Tab').show();
    $('#' + which + 'Link').parent().addClass("active");
  }
  
  function reset() {
    $("#queryResult").hide();
    $("#queryResultEmpty").hide();
    $("#queryHistoryResult").hide();
    $("#queryHistoryResultEmpty").hide();
  }
  
  function showLoadingSpinner() {
    console.log("Starting spinner...");
    $("#processingWrapper").show();
    $("#wait").show();
  }
  
  function hideLoadingSpinner() {
    console.log("Stopping spinner...");
    $("#processingWrapper").hide();
    $("#wait").hide();
  }
  
  function showToast(message, type) {
    // Create toast container if it doesn't exist
    if ($('#toast-container').length === 0) {
      $('body').append('<div id="toast-container" style="position: fixed; top: 20px; right: 20px; z-index: 9999;"></div>');
    }
    
    // Determine toast color based on type
    let bgColor = '';
    let iconClass = '';
    
    switch(type) {
      case 'success':
        bgColor = 'bg-success';
        iconClass = 'check_circle';
        break;
      case 'error':
        bgColor = 'bg-danger';
        iconClass = 'error';
        break;
      case 'warning':
        bgColor = 'bg-warning';
        iconClass = 'warning';
        break;
      default:
        bgColor = 'bg-info';
        iconClass = 'info';
    }
    
    // Create toast element
    const toastId = 'toast-' + Date.now();
    const toast = `
      <div id="${toastId}" class="toast ${bgColor} text-white" role="alert" aria-live="assertive" aria-atomic="true" data-delay="5000">
        <div class="toast-header ${bgColor} text-white">
          <i class="material-icons mr-2">${iconClass}</i>
          <strong class="mr-auto">${type.charAt(0).toUpperCase() + type.slice(1)}</strong>
          <button type="button" class="ml-2 mb-1 close text-white" data-dismiss="toast" aria-label="Close">
            <span aria-hidden="true">&times;</span>
          </button>
        </div>
        <div class="toast-body">
          ${message}
        </div>
      </div>
    `;
    
    // Add toast to container
    $('#toast-container').append(toast);
    
    // Show toast
    $(`#${toastId}`).toast('show');
    
    // Remove toast after it's hidden
    $(`#${toastId}`).on('hidden.bs.toast', function() {
      $(this).remove();
    });
    
    // Fallback to alert if toast doesn't work
    console.log(`${type.toUpperCase()}: ${message}`);
  }
});
