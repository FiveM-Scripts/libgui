setTick(function()
{
    Wait(1);

    if (IsControlJustReleased(1, 166)) // F5
        focus();
});

RegisterNuiCallbackType("hide")
on("__cfx_nui:hide", function()
{
	unfocus();
});

function focus()
{
    SendNuiMessage(JSON.stringify({ show: true }));
    SetNuiFocus(true, true);

    TransitionToBlurred(200);
}

function unfocus()
{
    SetNuiFocus(false, false);
    
    TransitionFromBlurred(200);
}

function uuidv4()
{
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
}