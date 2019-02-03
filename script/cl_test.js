let interface;
let items = [];

on("libgui:init", function(interfaceBuilder)
{
    // Why is everything inside an array all of the sudden?!?!?!
    interface = interfaceBuilder.createInterface()[0];

    let window1 = interface.createWindow()[0];
    window1.addItemText("Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum. Stet clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet. Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum. Stet clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet.");
    
    let window2 = interface.createWindow(400, 400, "Debug")[0];
    window2.setClosable(false);
    window2.addItemText("Position:")[0];

    window2.addItemSeperator();

    items.push(window2.addItemText()[0]);
    items.push(window2.addItemText()[0]);
    items.push(window2.addItemText()[0]);

    window2.addItemSeperator(20);

    let container = window2.createContainer()[0];

    container.addItemButton(-1, -1, "Kill", function() { SetEntityHealth(PlayerPedId(), 0); })[0];

    container.addItemSeperator();

    let button1 = container.addItemButton(60, 100, "Disabled")[0];
    button1.setDisabled(true);

    window2.addItemSeperator();

    let button2 = window2.addItemButton(30, 80, "Disabled 2")[0];
    button2.setDisabled(true);
});

setTick(async function()
{
    await Wait(500);
    if (!interface || !interface.isVisible())
        return;
    
    let coords = GetEntityCoords(PlayerPedId());
    items[0].setText("x: " + coords[0]);
    items[1].setText("y: " + coords[1]);
    items[2].setText("z: " + coords[2]);
});

setTick(function()
{
    if (IsControlJustReleased(1, 166) && interface) // F5
        interface.show();
});