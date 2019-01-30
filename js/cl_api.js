const interfaces = [];

setImmediate(function()
{
    const interfaceManager = {
        createInterface: Object.freeze(function()
        {
            return buildInterface();
        })
    };

    Wait(1);
    emit("libgui:init", interfaceManager);
});

function buildInterface()
{
    const id = uuidv4();
    const interface = {
        id: Object.freeze(id)
    };

    interfaces.push(interface);
    return interface;
}