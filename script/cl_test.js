let interface;
let items = [];

on("libgui:init", function(interfaceBuilder)
{
    // Why is everything inside an array all of the sudden?!?!?!
    interface = interfaceBuilder.createInterface()[0];

    let window1 = interface.createWindow()[0];
    window1.addItemText("Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum. Stet clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet. Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum. Stet clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet.");
    window1.setOnClose(function()
    {
        console.log("Gone as always");
    });

    let window2 = interface.createWindow(400, 400, "Debug")[0];
    window2.setClosable(false);

    window2.addItemText("Position:")[0];
    window2.addItemSeperator();

    for (let i = 0; i < 3; i++)
    {
        let container = window2.createContainer()[0];

        let itemText;
        switch (i)
        {
            case 0:
            itemText = "x:";
            break;
            case 1:
            itemText = "y:";
            break;
            case 2:
            itemText = "z:";
            break;
        }
        container.addItemText(itemText, 17)[0];

        items.push(container.addItemTextField()[0]);
        items[i].setDisabled(true);

        window2.addItemSeperator(20);
    }

    let container = window2.createContainer()[0];
    container.addItemButton(-1, -1, "Kill", function() { SetEntityHealth(PlayerPedId(), 0) } )[0];
    container.addItemSeperator();
    let button1 = container.addItemButton(100, 60, "Disabled")[0];
    button1.setDisabled(true);
    container.addItemSeperator();
    container.addItemButton(80, 50, "Create sub-window", function() { window2.createSubWindow(-1, -1, "HYPE") } )[0];
    window2.addItemSeperator();

    let button2 = window2.addItemButton(80, 30, "Disabled 2")[0];
    button2.setDisabled(true);
    window2.addItemSeperator();

    let container2 = window2.createContainer()[0];
    let textField1 = container2.addItemTextField(-1, -1)[0];
    textField1.setOnEnter(function() { spawnCar(); });
    items.push(textField1);
    container2.addItemSeperator();
    items.push(container2.addItemButton(85, 30, "Spawn Car", function() { spawnCar(); })[0]);
    container2.addItemSeperator();
    items.push(container2.addItemText()[0]);
});

function spawnCar()
{
    setImmediate(async function()
    {
        let carName = items[3].getText()[0];
        let carHash = GetHashKey(carName);
        if (!IsModelAVehicle(carHash))
        {
            items[5].setText("Invalid entry!");
            return;
        }

        items[3].setDisabled(true);
        items[4].setDisabled(true);
        items[5].setText("");

        RequestModel(carHash);
        while (!HasModelLoaded(carHash))
        {
            await Wait(1);
        }

        let playerPed = PlayerPedId();
        let playerPos = GetEntityCoords(playerPed);
        let car = CreateVehicle(carHash, playerPos[0], playerPos[1], playerPos[2], GetEntityHeading(playerPed), true);
        SetPedIntoVehicle(playerPed, car, -1);
        SetVehicleAsNoLongerNeeded(car);

        items[3].setDisabled(false);
        items[4].setDisabled(false);
        items[5].setText("Spawned " + carName + "!");
    });
}

setTick(async function()
{
    await Wait(500);
    if (!interface || !interface.isVisible())
        return;
    
    let coords = GetEntityCoords(PlayerPedId());
    items[0].setText(coords[0]);
    items[1].setText(coords[1]);
    items[2].setText(coords[2]);
});

setTick(function()
{
    if (!interface || interface.isVisible()[0])
        return;

    if (IsControlJustReleased(1, 166)) // F5
        interface.show();
});