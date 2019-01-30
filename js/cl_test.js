on("libgui:init", function(interfaceManager)
{
    const interface = interfaceManager.createInterface()[0]; // TODO: Investigate why it's an array now?!?!?!

    console.log("TEST: Created interface with id " + interface.id);
});