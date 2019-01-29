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