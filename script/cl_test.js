let interface;
let items = [];

on("libgui:init", function(interfaceBuilder)
{
    // TODO: Investigate why it's creating arrays now?!?!?!
    interface = interfaceBuilder.createInterface()[0];
    let window1 = interface.createWindow()[0];
    window1.addItemText("Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum. Stet clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet. Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum. Stet clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet.");
    let window2 = interface.createWindow(400, 400, "Debug")[0];
    window2.setClosable(false);
    window2.addItemText("Position:")[0];
    items.push(window2.addItemText()[0]);
    items.push(window2.addItemText()[0]);
    items.push(window2.addItemText()[0]);
});

setTick(function()
{
    Wait(500);
    if (items.length == 0)
        return;
    
    let coords = GetEntityCoords(PlayerPedId());
    items[0].setText("x: " + coords[0]);
    items[1].setText("y: " + coords[1]);
    items[2].setText("z: " + coords[2]);
});

setTick(function()
{
    Wait(1);

    if (IsControlJustReleased(1, 166) && interface) // F5
        interface.show();
});