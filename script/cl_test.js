let interface;

on("libgui:init", function(interfaceBuilder)
{
    interface = interfaceBuilder.createInterface()[0]; // TODO: Investigate why it's an array now?!?!?!
    let window1 = interface.createWindow()[0];
    window1.addItemText("Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum. Stet clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet. Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum. Stet clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet.");
    let window2 = interface.createWindow(400, 400, "Deja Vu")[0];
    window2.addItemText("Deja");
    window2.addItemText();
    window2.addItemText("Vu");
    let window3 = interface.createWindow(50, 100, "New Window")[0];
});

setTick(function()
{
    Wait(1);

    if (IsControlJustReleased(1, 166) && interface) // F5
        interface.show();
});