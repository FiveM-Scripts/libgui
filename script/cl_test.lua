local interface
local items = {}

local function spawnCar()
    local carName = items[4].getText()
    local carHash = GetHashKey(carName)
    if not IsModelAVehicle(carHash) then
        items[6].setText("Invalid entry!")
        return
    end

    items[4].setDisabled(true)
    items[5].setDisabled(true)
    items[6].setText("")

    RequestModel(carHash)
    while not HasModelLoaded(carHash) do
        Wait(1)
    end

    local playerPed = PlayerPedId()
    local playerPos = GetEntityCoords(playerPed)
    local car = CreateVehicle(carHash, playerPos.x, playerPos.y, playerPos.z, GetEntityHeading(playerPed), true)
    SetPedIntoVehicle(playerPed, car, -1)
    SetVehicleAsNoLongerNeeded(car)

    items[4].setDisabled(false)
    items[5].setDisabled(false)
    items[6].setText("Spawned " .. carName .. "!")
end

AddEventHandler("libgui:init", function(interfaceBuilder)
    interface = interfaceBuilder.createInterface()

    local window1 = interface.createWindow()
    window1.addItemText("Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum. Stet clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet. Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum. Stet clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet.")
    window1.setOnClose(function()
        print("Gone as always")
    end)

    local window2 = interface.createWindow(400, 400, "Debug")
    window2.setClosable(false)

    window2.addItemText("Position:")
    window2.addItemSeperator()

    for i = 1, 3 do
        local container = window2.createContainer()

        local itemText;
        if i == 1 then
            itemText = "x:"
        elseif i == 2 then
            itemText = "y:"
        elseif i == 3 then
            itemText = "z:"
        end
        container.addItemText(itemText, 17)

        table.insert(items, container.addItemTextField());
        items[i].setDisabled(true)

        window2.addItemSeperator(20)
    end

    local container = window2.createContainer()
    container.addItemButton(-1, -1, "Kill", function() SetEntityHealth(PlayerPedId(), 0) end)
    container.addItemSeperator()
    local button1 = container.addItemButton(100, 60, "Disabled")
    button1.setDisabled(true)
    container.addItemSeperator()
    container.addItemButton(80, 50, "Create sub-window", function() window2.createSubWindow(-1, -1, "HYPE") end)
    window2.addItemSeperator()

    local button = window2.addItemButton(80, 30, "Disabled 2")
    button.setDisabled(true)
    window2.addItemSeperator()

    local container2 = window2.createContainer()
    local textField1 = container2.addItemTextField(-1, -1)
    textField1.setOnEnter(function() spawnCar() end)
    table.insert(items, textField1)
    container2.addItemSeperator()
    table.insert(items, container2.addItemButton(85, 30, "Spawn Car", function() spawnCar() end))
    container2.addItemSeperator()
    table.insert(items, container2.addItemText())
end)

Citizen.CreateThread(function()
    while true do
        Wait(500)
        if interface and interface.isVisible() then
            local coords = GetEntityCoords(PlayerPedId())
            items[1].setText(coords.x)
            items[2].setText(coords.y)
            items[3].setText(coords.z)
        end
    end
end)

Citizen.CreateThread(function()
    while true do
        Wait(1)

        if IsControlJustReleased(1, 167) and interface and not interface.isVisible() then -- F6
            interface.show()
        end
    end
end)