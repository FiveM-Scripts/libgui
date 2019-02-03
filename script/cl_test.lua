local interface
local items = {}

AddEventHandler("libgui:init", function(interfaceBuilder)
    interface = interfaceBuilder.createInterface()
    local window1 = interface.createWindow()
    window1.addItemText("Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum. Stet clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet. Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum. Stet clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet.")
    local window2 = interface.createWindow(400, 400, "Debug")
    window2.setClosable(false)
    window2.addItemText("Position:")
    table.insert(items, window2.addItemText())
    table.insert(items, window2.addItemText())
    table.insert(items, window2.addItemText())
    window2.addItemButton(-1, -1, "Kill", function() SetEntityHealth(PlayerPedId(), 0) end)
    local button = window2.addItemButton(30, 80, "Disabled")
    button.setDisabled(true)
end)

Citizen.CreateThread(function()
    while true do
        Wait(500)
        if #items > 0 then -- Failsafe
            local coords = GetEntityCoords(PlayerPedId())
            items[1].setText("x: " .. coords.x)
            items[2].setText("y: " .. coords.y)
            items[3].setText("z: " .. coords.z)
        end
    end
end)

Citizen.CreateThread(function()
    while true do
        Wait(1)

        if IsControlJustReleased(1, 167) and interface then -- F6
            interface.show()
        end
    end
end)